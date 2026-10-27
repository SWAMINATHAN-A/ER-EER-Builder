import {
  database,
  ref,
  set,
  get,
  remove,
  onValue,
} from './firebase.js';

/**
 * ==========================================================
 * SCHEMA DIAGRAM PERSISTENCE (Diagram Studio)
 * Path: users/{userId}/schemas/{schemaId}
 * ==========================================================
 */

export async function saveUserSchema(userId, { id, title, mode, nodes, edges }) {
  if (!userId) {
    // Fallback to local storage for unauthenticated / guest offline
    const localKey = `local_schemas`;
    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
    const schemaId = id || `schema-${Date.now()}`;
    const newSchema = {
      id: schemaId,
      title: title || 'Untitled Schema',
      mode: mode || 'er',
      nodes: nodes || [],
      edges: edges || [],
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };
    const updated = existing.filter((s) => s.id !== schemaId);
    updated.unshift(newSchema);
    localStorage.setItem(localKey, JSON.stringify(updated));
    return newSchema;
  }

  const schemaId = id || `schema-${Date.now()}`;
  const schemaRef = ref(database, `users/${userId}/schemas/${schemaId}`);

  // Fetch existing schema to preserve createdAt
  let createdAt = Date.now();
  try {
    const snap = await get(schemaRef);
    if (snap.exists() && snap.val()?.createdAt) {
      createdAt = snap.val().createdAt;
    }
  } catch (err) {
    console.warn('Error reading existing schema metadata:', err);
  }

  const cleanNodes = nodes ? JSON.parse(JSON.stringify(nodes)) : [];
  const cleanEdges = edges ? JSON.parse(JSON.stringify(edges)) : [];

  const payload = {
    id: schemaId,
    title: title || 'Untitled Schema',
    mode: mode || 'er',
    nodes: cleanNodes,
    edges: cleanEdges,
    createdAt,
    updatedAt: Date.now(),
  };

  await set(schemaRef, payload);
  return payload;
}

export async function getUserSchemas(userId) {
  if (!userId) {
    return JSON.parse(localStorage.getItem('local_schemas') || '[]');
  }

  const schemasRef = ref(database, `users/${userId}/schemas`);
  const snapshot = await get(schemasRef);

  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  const list = Object.values(data);
  // Sort descending by updatedAt
  return list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export function subscribeToUserSchemas(userId, callback) {
  if (!userId) {
    const list = JSON.parse(localStorage.getItem('local_schemas') || '[]');
    callback(list);
    return () => {};
  }

  const schemasRef = ref(database, `users/${userId}/schemas`);
  const unsubscribe = onValue(
    schemasRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      const data = snapshot.val();
      const list = Object.values(data).sort(
        (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
      );
      callback(list);
    },
    (err) => {
      console.error('Realtime Database schemas subscription error:', err);
      // Fallback
      callback([]);
    }
  );

  return unsubscribe;
}

export async function deleteUserSchema(userId, schemaId) {
  if (!userId) {
    const existing = JSON.parse(localStorage.getItem('local_schemas') || '[]');
    const updated = existing.filter((s) => s.id !== schemaId);
    localStorage.setItem('local_schemas', JSON.stringify(updated));
    return true;
  }

  const schemaRef = ref(database, `users/${userId}/schemas/${schemaId}`);
  await remove(schemaRef);
  return true;
}

/**
/**
 * Utility to get an effective user ID for Firebase Realtime Database persistence.
 * If user is authenticated, returns their Firebase auth UID.
 * Otherwise, uses a persistent guest UID from localStorage.
 */
export function getEffectiveUserId(userId) {
  if (userId) return userId;
  const guestKey = 'er_studio_guest_uid';
  let guestUid = null;
  try {
    guestUid = typeof localStorage !== 'undefined' ? localStorage.getItem(guestKey) : null;
    if (!guestUid) {
      guestUid = 'guest_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(guestKey, guestUid);
    }
  } catch {
    guestUid = 'guest_session_' + Date.now();
  }
  return guestUid;
}

/**
 * ==========================================================
 * PRACTICE ARENA QUESTION PROGRESS
 * Path: users/{userId}/practiceProgress/{questionId}
 * ==========================================================
 */

export async function saveQuestionProgress(userId, questionId, progress) {
  const cleanNodes = progress.savedNodes ? JSON.parse(JSON.stringify(progress.savedNodes)) : null;
  const cleanEdges = progress.savedEdges ? JSON.parse(JSON.stringify(progress.savedEdges)) : null;
  const cleanSubAnswers = progress.userSubAnswers ? JSON.parse(JSON.stringify(progress.userSubAnswers)) : {};

  const payload = {
    questionId,
    status: progress.status || 'in-progress',
    score: typeof progress.score === 'number' ? progress.score : null,
    isPerfect: Boolean(progress.isPerfect),
    userSubAnswers: cleanSubAnswers,
    mistakesCount: progress.mistakesCount ?? 0,
    savedNodes: cleanNodes,
    savedEdges: cleanEdges,
    updatedAt: Date.now(),
  };

  const localKey = 'practice_progress_cache';
  const cached = JSON.parse(localStorage.getItem(localKey) || '{}');
  cached[questionId] = payload;
  localStorage.setItem(localKey, JSON.stringify(cached));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('practice-progress-updated', { detail: cached }));
  }

  const effectiveUid = getEffectiveUserId(userId);
  try {
    const progRef = ref(database, `users/${effectiveUid}/practiceProgress/${questionId}`);
    await set(progRef, payload);
  } catch (err) {
    console.warn('Realtime Database practice save error (using local cache):', err);
  }
  return payload;
}

export async function getUserPracticeProgress(userId) {
  const localKey = 'practice_progress_cache';
  const cached = JSON.parse(localStorage.getItem(localKey) || '{}');
  const effectiveUid = getEffectiveUserId(userId);

  try {
    const progRef = ref(database, `users/${effectiveUid}/practiceProgress`);
    const snapshot = await get(progRef);
    if (!snapshot.exists()) return cached;

    const data = snapshot.val();
    const merged = { ...cached, ...data };
    localStorage.setItem(localKey, JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.warn('Could not fetch remote practice progress, using cache:', err);
    return cached;
  }
}

export function subscribeToUserPracticeProgress(userId, callback) {
  const localKey = 'practice_progress_cache';
  const getCached = () => JSON.parse(localStorage.getItem(localKey) || '{}');
  const effectiveUid = getEffectiveUserId(userId);

  callback(getCached());

  const progRef = ref(database, `users/${effectiveUid}/practiceProgress`);
  const unsubscribe = onValue(
    progRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(getCached());
        return;
      }
      const remoteData = snapshot.val();
      const merged = { ...getCached(), ...remoteData };
      localStorage.setItem(localKey, JSON.stringify(merged));
      callback(merged);
    },
    (err) => {
      console.warn('Realtime Database practice subscription error:', err);
      callback(getCached());
    }
  );

  return unsubscribe;
}

/**
 * ==========================================================
 * QUADRATIC HASHING PRACTICE PROGRESS
 * Path: users/{userId}/hashingProgress/{questionId}
 * ==========================================================
 */

export async function saveHashingQuestionProgress(userId, questionId, progress) {
  const cleanAnswers = progress.userSubAnswers ? JSON.parse(JSON.stringify(progress.userSubAnswers)) : {};

  const payload = {
    questionId,
    status: progress.status || 'in-progress',
    score: typeof progress.score === 'number' ? progress.score : null,
    isPerfect: Boolean(progress.isPerfect),
    userSubAnswers: cleanAnswers,
    mistakesCount: progress.mistakesCount ?? 0,
    updatedAt: Date.now(),
  };

  const localKey = 'hashing_progress_cache';
  const cached = JSON.parse(localStorage.getItem(localKey) || '{}');
  cached[questionId] = payload;
  localStorage.setItem(localKey, JSON.stringify(cached));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('hashing-progress-updated', { detail: cached }));
  }

  const effectiveUid = getEffectiveUserId(userId);
  try {
    const progRef = ref(database, `users/${effectiveUid}/hashingProgress/${questionId}`);
    await set(progRef, payload);
  } catch (err) {
    console.warn('Realtime Database hashing save error (using local cache):', err);
  }
  return payload;
}

export async function getUserHashingProgress(userId) {
  const localKey = 'hashing_progress_cache';
  const cached = JSON.parse(localStorage.getItem(localKey) || '{}');
  const effectiveUid = getEffectiveUserId(userId);

  try {
    const progRef = ref(database, `users/${effectiveUid}/hashingProgress`);
    const snapshot = await get(progRef);
    if (!snapshot.exists()) return cached;

    const data = snapshot.val();
    const merged = { ...cached, ...data };
    localStorage.setItem(localKey, JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.warn('Could not fetch remote hashing progress, using cache:', err);
    return cached;
  }
}

export function subscribeToUserHashingProgress(userId, callback) {
  const localKey = 'hashing_progress_cache';
  const getCached = () => JSON.parse(localStorage.getItem(localKey) || '{}');
  const effectiveUid = getEffectiveUserId(userId);

  callback(getCached());

  const progRef = ref(database, `users/${effectiveUid}/hashingProgress`);
  const unsubscribe = onValue(
    progRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(getCached());
        return;
      }
      const remoteData = snapshot.val();
      const merged = { ...getCached(), ...remoteData };
      localStorage.setItem(localKey, JSON.stringify(merged));
      callback(merged);
    },
    (err) => {
      console.warn('Realtime Database hashing subscription error:', err);
      callback(getCached());
    }
  );

  return unsubscribe;
}



import { Users, GraduationCap, Award, IdCard, School, User } from 'lucide-react';
import neerajImg from '../assets/Neeraj.jpeg';
import prithivImg from '../assets/Prithiv.jpeg';
import swaminathanImg from '../assets/swaminathan.jpg';

export default function DevelopedBy() {
  const developers = [
    {
      id: 'profile-prithivraj',
      name: 'Prithivraj',
      regNo: '25BCE1073',
      role: 'Student Developer',
      degree: 'B.Tech Computer Science & Engineering',
      initials: 'P',
      image: prithivImg,
    },
    {
      id: 'profile-sai-neeraj',
      name: 'Sai Neeraj',
      regNo: '25BCE1066',
      role: 'Student Developer',
      degree: 'B.Tech Computer Science & Engineering',
      initials: 'SN',
      image: neerajImg,
    },
  ];

  return (
    <div
      id="developed-by-page"
      className="h-full w-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8"
    >
      <div id="developed-by-container" className="max-w-4xl mx-auto space-y-10">
        <header id="developed-by-header" className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
            <Users className="w-3.5 h-3.5" />
            Project Credits & Team Attribution
          </div>
          <h1
            id="developed-by-main-title"
            className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl"
          >
            Developed By
          </h1>
          <p
            id="developed-by-subtitle"
            className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto"
          >
            Entity-Relationship Diagram Builder designed and implemented as part of the Database
            Management Systems curriculum.
          </p>
        </header>

        <section id="developers-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {developers.map((dev) => (
            <article
              key={dev.id}
              id={dev.id}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-4"
            >
              <div className="relative">
                <div
                  id={`${dev.id}-avatar-wrapper`}
                  className="w-28 h-28 rounded-full border-4 border-zinc-100 dark:border-zinc-800 shadow-inner overflow-hidden bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-800/60 flex items-center justify-center text-zinc-400 dark:text-zinc-500"
                >
                  {dev.image ? (
                    <img
                      src={dev.image}
                      alt={dev.name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <User className="w-14 h-14 stroke-[1.5]" />
                  )}
                </div>

                <div
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs shadow-md border-2 border-white dark:border-zinc-900"
                  title="Verified Student Developer"
                >
                  <IdCard className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <h2 id={`${dev.id}-name`} className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {dev.name}
                </h2>
                <div className="inline-block px-2.5 py-0.5 rounded-md font-mono text-xs font-bold text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800">
                  Reg. No: {dev.regNo}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 w-full space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center justify-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                  <School className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{dev.degree}</span>
                </div>
                <div className="text-zinc-500 dark:text-zinc-500">{dev.role}</div>
              </div>
            </article>
          ))}
        </section>

        <section
          id="faculty-guidance-section"
          className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/70 dark:from-zinc-900 dark:via-zinc-900 dark:to-indigo-950/30 p-8 shadow-sm text-center relative overflow-hidden"
        >
          <div className="max-w-xl mx-auto space-y-3">
            <div className="relative inline-block mx-auto">
              <div className="w-28 h-28 rounded-full border-4 border-indigo-200 dark:border-indigo-800/80 shadow-md overflow-hidden mx-auto bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                <img
                  src={swaminathanImg}
                  alt="Dr. Swaminathan A"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shadow-md border-2 border-white dark:border-zinc-900"
                title="Faculty Mentor"
              >
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>

            <div className="text-xs uppercase tracking-widest font-semibold text-indigo-700 dark:text-indigo-400 flex items-center justify-center gap-1.5">
              <Award className="w-4 h-4" />
              Faculty Mentorship
            </div>

            <h2
              id="guided-by-text"
              className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl"
            >
              Guided By: Dr. Swaminathan A, Assistant Professor
            </h2>

            <p
              id="guided-by-department"
              className="text-sm text-zinc-600 dark:text-zinc-300 font-medium"
            >
              School of Computer Science and Engineering (SCOPE)
            </p>

            <div className="pt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Department of Database Systems • Academic Guidance & Project Supervision
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

import React from "react";
import { ArrowRight, CheckCircle2, GraduationCap, BookOpen, Users } from "lucide-react";

type Role = "student" | "teacher" | "parent";
interface RoleContentItem { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }>; bullets: string[] }
interface PersonasSectionProps {
  activeRole: Role;
  roleContent: Record<Role, RoleContentItem>;
  onOpenAuth: (mode?: "login" | "register", persona?: "parent" | "student") => void;
  onScrollToDemo: () => void;
}

export const PersonasSection: React.FC<PersonasSectionProps> = ({ activeRole, roleContent, onOpenAuth, onScrollToDemo }) => (
      <section
        id="for-everyone"
        className="min-h-[calc(100vh-72px)] flex flex-col justify-center py-8 sm:py-10 lg:py-12 relative bg-gradient-to-b from-amber-50/40 via-yellow-50/20 to-white border-y border-amber-200/50 scroll-mt-[72px] overflow-hidden"
      >
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-yellow-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-amber-200/25 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
          <div className="text-center max-w-3xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/95 border border-amber-300 text-amber-950 text-xs sm:text-sm font-black shadow-2xs">
              <Users className="w-4 h-4 text-amber-600 animate-pulse" />
              One Platform, Three Perspectives
            </div>
            <h2
              className="mt-3.5 text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black capitalize tracking-tight text-stone-900 leading-tight"
              style={{ wordSpacing: "0.2em" }}
            >
              BUILT FOR EVERYONE AROUND THE LEARNER
            </h2>
            <p className="mt-2 text-stone-600 font-semibold text-xs sm:text-sm md:text-base">
              Students learn, teachers guide, and parents stay connected.
            </p>
          </div>

          <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {(["parent", "student", "teacher"] as Role[]).map((role, i) => {
              const content = roleContent[role];
              const Icon = content.icon;
              const active = activeRole === role;

              return (
                <div
                  key={role}
                  className="text-left rounded-3xl p-5 sm:p-6 border-2 border-amber-300/80 bg-white/95 backdrop-blur-md shadow-lg shadow-amber-500/5 hover:shadow-xl hover:shadow-amber-500/15 hover:border-amber-400 hover:-translate-y-1 transition-all duration-300 reveal-on-scroll flex flex-col justify-between"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-11 h-11 rounded-2xl ${role === "student"
                          ? "bg-amber-100 text-amber-700"
                          : role === "teacher"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-sky-100 text-sky-700"
                          } flex items-center justify-center`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <h3 className="mt-4 text-lg sm:text-xl font-black text-stone-900">{content.title}</h3>
                    <p className="mt-1 text-xs sm:text-sm font-semibold text-stone-500">
                      {content.subtitle}
                    </p>

                    <ul className="mt-4 space-y-2.5">
                      {content.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-center gap-2.5 text-xs sm:text-sm text-stone-700 font-medium"
                        >
                          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (role === "parent") {
                        onOpenAuth("register");
                      } else if (role === "student") {
                        onOpenAuth("register", "student");
                      } else {
                        onScrollToDemo();
                      }
                    }}
                    className="mt-5 text-xs sm:text-sm font-extrabold text-amber-600 hover:text-amber-700 flex items-center gap-1 group transition-colors"
                  >
                    {role === "student"
                      ? "Start Learning"
                      : role === "teacher"
                        ? "See How It Works"
                        : "Parent Login"}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
);

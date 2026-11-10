import { BrowserFrame } from "@/components/BrowserFrame";
import { KindPill } from "@/components/Recruiter";
import { RoleHash } from "@/components/RoleHash";
import { SectionShell } from "@/components/SectionShell";
import { cv } from "@/content/cv";
import { AS_OF, companyShort, kindOf, period, roleYears } from "@/content/career";
import { ROLE_SHOT, clientOf, resultsFor, skillName } from "@/content/recruiter";
import { sitesForRole } from "@/content/sites";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Experience",
  description: "14 years building software, from backend work at Zega Software to frontend at Pentalog, TryAngle Labs and as an independent contractor: healthcare, fintech and cultural heritage products in React, Next.js, TypeScript and React Native.",
  path: "/experience",
});

const yrs = (n: number) => (n <= 1 ? "1 yr" : `${n} yrs`);
const rid = (id: string) => `role-${id}`;

/** With JS, the chosen role's page shows alone (CSS :has on its radio, no script to switch). */
function ChosenStyles() {
  const css = cv.roles.map((r) => `[data-js] .rc-ex:has(#pick-${rid(r.id)}:checked) #${rid(r.id)}{display:flex}`).join("");
  return (
    <style href="role-pages" precedence="medium">
      {css}
    </style>
  );
}

/*
  Experience as a list and a page: the roles down the left (when, title, company), and the chosen
  role on the right, written to be read: what the job was, the results, what Alex did, the stack,
  and a picture of the work where there is one. The newest role is open first; a link from the
  Overview (#role-…) opens its role.
*/
export default function ExperiencePage() {
  return (
    <SectionShell title="Experience" lead="Seven roles since 2012: backend first, then product teams and my own clients.">
      <ChosenStyles />
      <RoleHash />
      <div className="panel-grid rc-ex">
        <section aria-labelledby="roles" className="card card-col rc-ex-list">
          <div className="card-head">
            <h2 id="roles" className="card-title">
              Roles, newest first
            </h2>
          </div>
          <div className="scroll-y -mx-2" role="radiogroup" aria-labelledby="roles">
            {cv.roles.map((r, i) => (
              <label key={r.id} className="rc-pick" data-kind={kindOf(r.id)}>
                <input type="radio" name="role" id={`pick-${rid(r.id)}`} value={r.id} defaultChecked={i === 0} aria-controls={rid(r.id)} />
                <span className="key" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="rc-pick-co">{companyShort(r)}</span>
                  <span className="rc-pick-title">{r.title}</span>
                </span>
                <span className="rc-pick-when tnum">{period(r)}</span>
              </label>
            ))}
            <p className="rc-earlier">Earlier: {cv.earlier}</p>
          </div>
        </section>

        {cv.roles.map((r) => {
          const results = resultsFor(r.id);
          const client = clientOf(r);
          const shot = ROLE_SHOT[r.id];
          const sites = sitesForRole(r.id).filter((s) => s.image !== shot?.image);
          return (
            <article key={r.id} id={rid(r.id)} aria-labelledby={`${rid(r.id)}-h`} className="card card-col rc-ex-role" data-kind={kindOf(r.id)}>
              <div className="scroll-y @container">
                <header className="rc-role-head">
                  <div className="flex flex-wrap items-center gap-2">
                    <KindPill roleId={r.id} />
                    <span className="tnum text-[14px] text-muted">
                      {period(r)} · {yrs(roleYears(r, AS_OF))}
                    </span>
                  </div>
                  <h2 id={`${rid(r.id)}-h`} className="rc-role-h">
                    {r.title}
                  </h2>
                  <p className="text-[16px]">
                    {companyShort(r)}
                    {client ? ` for ${client}` : null}
                    {r.location ? <span className="text-muted"> · {r.location}</span> : null}
                  </p>
                </header>

                <div className="rc-role-body">
                  <div className="rc-role-main">
                    {results.length > 0 ? (
                      <ul className="rc-role-results" aria-label="Results">
                        {results.map((x) => (
                          <li key={x.label}>
                            <span className="rc-result-value tnum">{x.value}</span>
                            <span className="rc-result-label">{x.label}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <h3 className="rc-sub">What I did</h3>
                    <ul className="rc-bullets">
                      {r.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                    {r.stack.length > 0 || r.estimatedSkillIds?.length ? (
                      <>
                        <h3 className="rc-sub">Stack</h3>
                        <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
                          {r.stack.map((t) => (
                            <li key={t} className="rc-chip">
                              {t}
                            </li>
                          ))}
                          {r.estimatedSkillIds?.map((id) => (
                            <li key={id} className="rc-chip rc-chip-est" title="Not on the CV for this role: most likely used, by Alex's estimate">
                              {skillName(id).replace(/ \(.*\)$/, "")}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                  </div>
                  {shot || sites.length ? (
                    <div className="rc-role-media">
                      {shot ? (
                        <BrowserFrame image={shot.image} address={shot.address} alt={shot.alt} widths={shot.widths} width={shot.width} height={shot.height} sizes="(min-width: 1024px) 400px, 92vw" />
                      ) : null}
                      {sites.length ? (
                        <ul className="rc-sites" aria-label="Live sites">
                          {sites.map((s) => (
                            <li key={s.id}>
                              <a href={s.url} className="card-link">
                                {s.domain}
                              </a>
                              <span className="text-muted"> · {s.note}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Owner-editable site content lives in src/lib/site-config.ts (null = not provided, hide in UI); phase 2 moves it to admin-managed tables. Why: never show invented business data.
- Shared site chrome (Header/Footer) and the consultation dialog provider are mounted once in __root.tsx; every 가맹상담 CTA uses ConsultButton. Why: one modal, consistent behavior.
- Home hero imagery is isolated in HeroCarousel and sourced from Lovable Assets. Why: keep media sequencing and carousel behavior independent from page copy.

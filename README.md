# paper days

an interactive wall calendar built for a frontend engineering challenge.

## design choices

- **aesthetic**: editorial minimalism - cream paper, charcoal ink, rust-red accents. same type stack as vasishta.tech (Cormorant Garamond + Bebas Neue + DM Mono).
- **layout**: spiral-bound wall calendar with full-bleed hero image per month, split panel for the month/notes on the left and date grid on the right.
- **state**: no backend - notes persist via `localStorage`, keyed per month or per selected date range.

## features

- month navigation with a smooth page-flip transition
- date range selection - click start, hover to preview, click to confirm end
- notes per selection (month note or range note), persisted across sessions
- holiday markers for common US holidays
- today underlined for quick reference
- fully responsive - stacked layout on mobile

## run locally

```bash
npm install
npm run dev
```


<img width="1920" height="1040" alt="image" src="https://github.com/user-attachments/assets/94dec337-e959-4295-aa09-7fc104f938fb" />


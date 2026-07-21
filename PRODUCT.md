# Product

## Register

product

## Platform

web

## Users

A single operator: the person who builds and runs the channels, working alone on their own machine. There is no second audience, no collaborator, and no hand-off. The job to be done is turning a handful of short-form clips into a finished ranked countdown video that is ready to post. Because there is exactly one user who also built the tool, the interface can assume fluency and skip explanatory scaffolding — but it must never assume memory of decisions made weeks ago.

## Product Purpose

OpenRank is a local studio for producing "Top N" countdown shorts for TikTok, YouTube Shorts, and Instagram Reels. Clips arrive by link or file, get trimmed and cropped, receive a title card, rank numerals, and captions, and are exported as a 1080×1920 MP4. It runs entirely on the operator's machine — yt-dlp for retrieval, ffmpeg for the render — with no accounts, credits, or upload of source footage.

Success is cadence: publishing more shorts, faster. The measure is how little time and friction sits between having an idea and having a finished file ready to upload.

## Positioning

What you see is what renders. The live preview is not an approximation of the output — it is the output. Every design decision made in the preview, down to where a title wraps to a second line, survives into the exported MP4 exactly.

## Brand Personality

Calm, precise, utilitarian. A quiet workshop instrument rather than a piece of showmanship. The interface is restrained and technical; it states facts, uses exact numbers, and does not celebrate itself. Confidence shows through accuracy and predictability, not through energy.

Worth naming as an open tension: the *content* this tool produces is deliberately loud — bold numerals, punchy captions, high-contrast titles. That loudness belongs to the video, not to the chrome around it. The tool should stay quiet so the output can shout.

## Anti-references

- **Generic dark SaaS dashboard.** Near-black surface with one blue or green accent, identical repeating cards, Inter everywhere.
- **viblo.ai itself.** The light, templated, credit-metered editor being replaced — neither its look nor its friction.
- **A professional NLE (Premiere, DaVinci).** Dense multi-track timelines and endless panel stacks for a job that should take minutes.
- **A toy meme generator.** Gimmicky and childish, which would undercut that this is a real production tool.

## Design Principles

**The preview is the contract.** Anything the operator can see and adjust must render identically. When preview and export could diverge, the fix belongs in the code that reconciles them — never in a caveat asking the operator to imagine the difference.

**Speed is the feature.** Cadence is the success metric, so every added step, confirmation, or decision must earn its place. Prefer sensible defaults that can be overridden over prompts that must be answered.

**Quiet tool, loud output.** Reserve visual energy for the video being produced. The interface's job is to disappear into the work — restraint in the chrome is what lets the operator judge the content accurately.

**Built for one operator.** No collaboration, permissions, sharing, or onboarding surface. That freedom is spent on directness and density, not on decoration.

## Accessibility & Inclusion

No formal conformance target. Solid defaults are treated as requirements: visible keyboard focus on every interactive control, text contrast that stays comfortably readable rather than fashionably faint, and a genuine reduced-motion alternative for any animation. These are baseline craft, not a certification exercise.

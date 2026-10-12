import { useEffect, useRef, useState, type ChangeEvent, type ReactNode, type TouchEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, AudioLines, Camera, Check, ChevronLeft, ChevronRight, Heart, ImagePlus, Music2, Play, Settings2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import rose from "@/assets/midnight-rose.jpg";

const chapters = ["The invitation", "The birthday", "The person", "Her photographs", "The memories", "What makes her special", "A letter", "One last surprise"];
type Photo = { src: string; name: string };
type Story = { name: string; nickname: string; from: string; about: string; letter: string; wish: string; photos: Photo[] };
const blank: Story = { name: "", nickname: "", from: "", about: "", letter: "", wish: "", photos: [] };

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "A Birthday Story — Made Just for You" },
    { name: "description", content: "A private, cinematic birthday story made to celebrate someone wonderful." },
    { property: "og:title", content: "A Birthday Story — Made Just for You" },
    { property: "og:description", content: "Eight little chapters, made to celebrate someone wonderful." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: BirthdayStory,
});

function BirthdayStory() {
  const [story, setStory] = useState<Story>(blank);
  const [storyLoaded, setStoryLoaded] = useState(false);
  const [page, setPage] = useState(0);
  const [settings, setSettings] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [music, setMusic] = useState("");
  const [video, setVideo] = useState("");
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [notice, setNotice] = useState("");
  const audio = useRef<HTMLAudioElement | null>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    try {
      const text = localStorage.getItem("birthday-story-text-v1");
      const legacy = localStorage.getItem("birthday-story-v1");
      const saved: Partial<Story> = JSON.parse(text ?? legacy ?? "{}");
      const photos = localStorage.getItem("birthday-story-photos-v1");
      const savedPhotos: Photo[] = photos ? JSON.parse(photos) : saved.photos ?? [];
      setStory({ ...blank, ...saved, photos: Array.isArray(savedPhotos) ? savedPhotos : [] });
    } catch { setNotice("Saved details could not be restored."); }
    finally { setStoryLoaded(true); }
  }, []);
  useEffect(() => {
    if (!storyLoaded) return;
    const { photos, ...text } = story;
    try { localStorage.setItem("birthday-story-text-v1", JSON.stringify(text)); }
    catch { setNotice("Your details could not be saved on this device."); }
    try { localStorage.setItem("birthday-story-photos-v1", JSON.stringify(photos)); }
    catch { setNotice("Some photos could not be saved. Try fewer or smaller images."); }
  }, [story, storyLoaded]);
  useEffect(() => {
    if (!music) return;
    const player = new Audio(music); player.loop = true; player.volume = 0; audio.current = player;
    return () => { player.pause(); audio.current = null; };
  }, [music]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setSettings(false); setLightbox(null); }
      if (!settings && lightbox === null && event.key === "ArrowRight") setPage((p) => Math.min(7, p + 1));
      if (!settings && lightbox === null && event.key === "ArrowLeft") setPage((p) => Math.max(0, p - 1));
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [settings, lightbox]);

  const go = (value: number) => setPage(Math.max(0, Math.min(7, value)));
  const name = story.name.trim() || "beautiful soul";
  const start = () => {
    go(1); const player = audio.current; if (!player) return;
    player.currentTime = 0;
    player.play().then(() => {
      setPlaying(true); let volume = 0;
      const fade = window.setInterval(() => { volume = Math.min(.28, volume + .01); if (audio.current) audio.current.volume = volume; if (volume >= .28) window.clearInterval(fade); }, 72);
    }).catch(() => setPlaying(false));
  };
  const toggleMusic = () => {
    const player = audio.current;
    if (!player) { setSettings(true); return; }
    if (player.paused) player.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else { player.pause(); setPlaying(false); }
  };
  const addPhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.currentTarget.files ?? []).slice(0, 10 - story.photos.length);
    const added: Photo[] = [];
    for (const file of selected) try { added.push({ src: await shrink(file), name: file.name.replace(/\.[^.]+$/, "") }); }
    catch { setNotice("One photo could not be opened. Please try another image."); }
    if (added.length) { setStory((s) => ({ ...s, photos: [...s.photos, ...added].slice(0, 10) })); setNotice(`${added.length} photo${added.length === 1 ? "" : "s"} added.`); }
    event.currentTarget.value = "";
  };
  const addMusic = (event: ChangeEvent<HTMLInputElement>) => { const file = event.currentTarget.files?.[0]; if (file) { setMusic(URL.createObjectURL(file)); setPlaying(false); setNotice("Your song will begin when the story opens."); } };
  const addVideo = (event: ChangeEvent<HTMLInputElement>) => { const file = event.currentTarget.files?.[0]; if (file) { setVideo(URL.createObjectURL(file)); setFinished(false); setNotice("Your birthday video is ready for the last chapter."); } };
  const touchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchX.current === null) return;
    const x = event.changedTouches[0]?.clientX;
    if (x !== undefined && Math.abs(x - touchX.current) > 75) go(page + (x < touchX.current ? 1 : -1));
    touchX.current = null;
  };

  return <div className="birthday-app" onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null; }} onTouchEnd={touchEnd}>
    <div className="film-grain" aria-hidden="true" />
    <div className="heart-drift" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <span key={i}>{i % 3 === 1 ? "♡" : "♥"}</span>)}</div>
    <header className="story-header">
      <a className="wordmark" href="/" aria-label="A birthday story"><Heart /> <span>for you, always</span></a>
      <nav className="chapter-progress" aria-label="Story chapters">{chapters.map((chapter, i) => <button type="button" key={chapter} title={chapter} aria-label={`Chapter ${i + 1}: ${chapter}`} aria-current={page === i ? "step" : undefined} className={`progress-line${page === i ? " active" : ""}${page > i ? " past" : ""}`} onClick={() => go(i)} />)}</nav>
      <Button className="settings-trigger" onClick={() => setSettings(true)} size="icon" variant="ghost" title="Personalize this story" aria-label="Personalize this story"><Settings2 /></Button>
    </header>
    <main className="chapter-stage" aria-live="polite"><section className={`chapter chapter-${page + 1}`} key={page}>
      {page === 0 && <Opening onStart={start} />}
      {page === 1 && <Birthday name={name} photo={story.photos[0]} onAdd={() => setSettings(true)} onNext={() => go(2)} />}
      {page === 2 && <About story={story} name={name} onPhoto={(i) => story.photos[i] && setLightbox(i)} onAdd={() => setSettings(true)} />}
      {page === 3 && <Gallery photos={story.photos} onPhoto={setLightbox} onAdd={() => setSettings(true)} />}
      {page === 4 && <Memories photos={story.photos} onPhoto={setLightbox} onAdd={() => setSettings(true)} />}
      {page === 5 && <Qualities expanded={expanded} onToggle={setExpanded} />}
      {page === 6 && <Letter story={story} name={story.nickname.trim() || name} />}
      {page === 7 && <Final story={story} name={name} video={video} finished={finished} onEnded={() => setFinished(true)} onAdd={() => setSettings(true)} onReplay={() => { setFinished(false); go(0); }} />}
    </section></main>
    {page > 0 && <footer className="story-footer">
      <Button className="nav-control" onClick={() => go(page - 1)} variant="ghost"><ArrowLeft /> <span>Back</span></Button>
      <span className="chapter-count">{String(page + 1).padStart(2, "0")} <i>/</i> 08</span>
      <div className="footer-actions">
        <Button className={`music-control${playing ? " is-playing" : ""}`} onClick={toggleMusic} size="icon" variant="ghost" aria-label={playing ? "Pause music" : "Play music or add a song"} title={playing ? "Pause music" : "Music settings"}>{playing ? <AudioLines /> : <Music2 />}</Button>
        <Button className="nav-control nav-next" onClick={() => page < 7 ? go(page + 1) : go(0)} variant="ghost"><span>{page < 7 ? "Next" : "Again"}</span>{page < 7 ? <ArrowRight /> : <Heart />}</Button>
      </div>
    </footer>}
    {settings && <Personalize story={story} notice={notice} musicReady={Boolean(music)} videoReady={Boolean(video)} onStory={setStory} onPhotos={addPhotos} onMusic={addMusic} onVideo={addVideo} onClose={() => setSettings(false)} />}
    {lightbox !== null && story.photos[lightbox] && <Lightbox photo={story.photos[lightbox]} onClose={() => setLightbox(null)} onPrevious={() => setLightbox((lightbox - 1 + story.photos.length) % story.photos.length)} onNext={() => setLightbox((lightbox + 1) % story.photos.length)} />}
  </div>;
}

async function shrink(file: File): Promise<string> {
  const source = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error()); reader.onerror = () => reject(new Error()); reader.readAsDataURL(file); });
  const image = new Image(); image.src = source;
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error()); });
  const scale = Math.min(1, 1440 / image.width, 1440 / image.height); const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas unavailable");
  context.drawImage(image, 0, 0, canvas.width, canvas.height); return canvas.toDataURL("image/jpeg", .78);
}

function Opening({ onStart }: { onStart: () => void }) { return <div className="opening-layout">
  <img className="opening-rose" src={rose} alt="A burgundy rose and drifting petals" width={1792} height={1024} />
  <div className="opening-copy"><Eyebrow>A little something made just for you</Eyebrow><h1>Hey, you<span>.</span></h1><p>I made something special for you.</p><Button className="cinema-button" onClick={onStart}>Open your birthday surprise <ArrowRight /></Button></div>
  <span className="opening-caption">A story in eight little chapters</span>
</div>; }
function Eyebrow({ children }: { children: ReactNode }) { return <span className="eyebrow"><i />{children}</span>; }

function Birthday({ name, photo, onAdd, onNext }: { name: string; photo: Photo | undefined; onAdd: () => void; onNext: () => void }) { return <div className="birthday-layout">
  <div className="birthday-copy"><Eyebrow>Today is all about you</Eyebrow><h2>Happy<br />Birthday<span>,</span></h2><p className="birthday-name">{name}</p><p className="chapter-description">Today is a lovely reason to celebrate the person you are—and all the moments still waiting for you.</p><Button className="text-link" onClick={onNext} variant="ghost">Discover her story <ArrowRight /></Button></div>
  <figure className={`birthday-portrait${photo ? " has-photo" : ""}`}>{photo ? <img src={photo.src} alt={photo.name || "A favourite photograph"} /> : <button className="portrait-invitation" onClick={onAdd} type="button"><Camera /><span>A favourite photo<br />belongs here</span><small><ImagePlus /> Add your photos</small></button>}<figcaption>one of a kind, every day</figcaption></figure><span className="chapter-mark">CHAPTER TWO <i>—</i> JUST FOR YOU</span>
</div>; }

function About({ story, name, onPhoto, onAdd }: { story: Story; name: string; onPhoto: (index: number) => void; onAdd: () => void }) { return <div className="about-layout">
  <div className="about-copy"><Eyebrow>The person behind the smile</Eyebrow><h2>There is something<br />beautiful about <em>{name}</em></h2><p>{story.about || "A whole chapter for the little things, the big things, and everything that makes her unmistakably herself."}</p><Button className="text-link" onClick={onAdd} variant="ghost">Make this chapter yours <ArrowRight /></Button></div>
  <div className="about-collage" aria-label="A personal photo portrait collage">{[0, 1, 2, 3].map((i) => <button className={`collage-photo collage-${i + 1}`} key={i} onClick={() => story.photos[i] ? onPhoto(i) : onAdd()} type="button" aria-label={story.photos[i] ? `View ${story.photos[i]?.name || "photograph"}` : "Add a personal photograph"}>{story.photos[i] ? <img src={story.photos[i]?.src} alt={story.photos[i]?.name || "Personal memory"} /> : <ImagePlus />}</button>)}<span className="collage-caption">the wonderful, ordinary magic of you</span></div>
</div>; }

function Gallery({ photos, onPhoto, onAdd }: { photos: Photo[]; onPhoto: (index: number) => void; onAdd: () => void }) { return <div className="gallery-layout">
  <div className="chapter-heading gallery-heading"><Eyebrow>A collection of beautiful moments</Eyebrow><h2>Just <em>her.</em></h2><p>Every photograph holds a little piece of a story.</p></div>
  <div className="photo-montage">{Array.from({ length: 7 }, (_, i) => <button className={`montage-frame montage-${i + 1}`} key={i} onClick={() => photos[i] ? onPhoto(i) : onAdd()} type="button" aria-label={photos[i] ? `Open photograph ${i + 1}` : "Add a photograph"}>{photos[i] ? <img src={photos[i]?.src} alt={photos[i]?.name || `Personal photograph ${i + 1}`} loading="lazy" /> : <span><ImagePlus /><i>your moment</i></span>}</button>)}<button className="montage-add" onClick={onAdd}><ImagePlus /><span>Add a memory</span></button></div>
  <span className="gallery-count">{String(photos.length).padStart(2, "0")} <i>photographs</i></span>
</div>; }

function Memories({ photos, onPhoto, onAdd }: { photos: Photo[]; onPhoto: (index: number) => void; onAdd: () => void }) { const labels = ["A moment worth keeping", "The way the light fell", "A day to hold close", "One for the memory book"]; return <div className="memories-layout">
  <div className="chapter-heading"><Eyebrow>Moments worth keeping</Eyebrow><h2>Her beautiful<br /><em>memories.</em></h2></div>
  <div className="memory-filmstrip">{labels.map((label, i) => <article className={`memory-frame memory-${i + 1}`} key={label}><button className="memory-image" onClick={() => photos[i] ? onPhoto(i) : onAdd()} type="button" aria-label={photos[i] ? `View ${photos[i]?.name || label}` : "Add a memory photograph"}>{photos[i] ? <img src={photos[i]?.src} alt={photos[i]?.name || label} loading="lazy" /> : <ImagePlus />}</button><span className="memory-number">0{i + 1} <i>—</i> A MEMORY</span><h3>{photos[i]?.name || label}</h3></article>)}</div>
  <Button className="memories-add" onClick={onAdd} variant="ghost"><ImagePlus /> Add the moments you love</Button>
</div>; }

const qualities = [{ title: "Her smile", text: "The kind of light that finds its way into a room—and stays with you." }, { title: "Her spirit", text: "A one-of-a-kind way of seeing the world, and making it feel a little brighter." }, { title: "Her kindness", text: "A beautiful reminder that the smallest gestures can mean the most." }, { title: "Her laugh", text: "A sound that turns an ordinary moment into one you want to keep." }, { title: "Her strength", text: "Quiet, remarkable, and entirely her own." }, { title: "Simply her", text: "There is no one else quite like her. That is the whole magic." }];
function Qualities({ expanded, onToggle }: { expanded: number | null; onToggle: (index: number | null) => void }) { return <div className="qualities-layout">
  <div className="chapter-heading"><Eyebrow>If I had to describe her…</Eyebrow><h2>What makes her<br /><em>special.</em></h2></div><div className="quality-list">{qualities.map((item, i) => <button className={`quality-item${expanded === i ? " expanded" : ""}`} key={item.title} onClick={() => onToggle(expanded === i ? null : i)} aria-expanded={expanded === i}><span className="quality-number">0{i + 1}</span><span className="quality-text"><strong>{item.title}</strong>{expanded === i && <i>{item.text}</i>}</span><Sparkles /><span className="quality-plus">{expanded === i ? "−" : "+"}</span></button>)}</div>
</div>; }

function Letter({ story, name }: { story: Story; name: string }) { return <div className="letter-layout"><div className="letter-paper">
  <Eyebrow>A few words, from the heart</Eyebrow><h2>A letter <em>for you.</em></h2><div className="letter-rule"><i /><Heart /><i /></div><p className="letter-greeting">Dear {name},</p>
  <p className="letter-body">{story.letter || "I hope you know just how much joy your presence brings into the world. Today, I hope you feel celebrated, cared for, and surrounded by all the good things you give so freely to others. May this next chapter bring you little surprises, big adventures, and many reasons to smile."}</p>
  <p className="letter-closing">With all my love,</p><p className="letter-signature">{story.from.trim() || "Someone who cares"}</p><span className="letter-flower">✳</span>
</div><span className="chapter-mark">A NOTE, JUST FOR YOU <i>—</i> 07</span></div>; }

function Final({ story, name, video, finished, onEnded, onAdd, onReplay }: { story: Story; name: string; video: string; finished: boolean; onEnded: () => void; onAdd: () => void; onReplay: () => void }) { const favourite = story.photos.at(-1); return <div className={`final-layout${finished ? " final-finished" : ""}`}>
  <div className="final-backdrop">{favourite && <img src={favourite.src} alt="" />}</div>
  {!finished ? <div className="final-content"><Eyebrow>One final thing…</Eyebrow><h2>This one is<br /><em>just for you.</em></h2><p>I wanted to tell you everything through this video.</p>
    {video ? <div className="video-frame"><video controls playsInline preload="metadata" src={video} onEnded={onEnded}>Your browser does not support video playback.</video></div> : <button className="video-invitation" onClick={onAdd}><span className="video-play"><Play fill="currentColor" /></span><span>Her birthday film</span><small>Add your personal video</small></button>}
    {!video && <Button className="text-link" onClick={onAdd} variant="ghost">Add the birthday video <ArrowRight /></Button>}
  </div> : <div className="final-content final-message"><Eyebrow>Happy birthday</Eyebrow><h2>Happy Birthday,<br /><em>{name}.</em></h2><p>{story.wish || "You deserve all the happiness, love, and beautiful moments in the world. Here is to everything wonderful still ahead."}</p><p className="final-signature">With love, {story.from.trim() || "always"}</p><Button className="cinema-button" onClick={onReplay}>Replay from the beginning <ArrowLeft /></Button></div>}
  <span className="final-index">THE LAST CHAPTER <i>—</i> 08</span>
</div>; }

function Personalize({ story, notice, musicReady, videoReady, onStory, onPhotos, onMusic, onVideo, onClose }: { story: Story; notice: string; musicReady: boolean; videoReady: boolean; onStory: (value: Story) => void; onPhotos: (event: ChangeEvent<HTMLInputElement>) => void; onMusic: (event: ChangeEvent<HTMLInputElement>) => void; onVideo: (event: ChangeEvent<HTMLInputElement>) => void; onClose: () => void }) {
  const update = (key: keyof Omit<Story, "photos">, value: string) => onStory({ ...story, [key]: value });
  return <div className="panel-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><aside className="personalize-panel" role="dialog" aria-modal="true" aria-label="Personalize your birthday story">
    <div className="panel-heading"><div><Eyebrow>A little more personal</Eyebrow><h2>Make it <em>yours.</em></h2></div><Button className="panel-close" onClick={onClose} size="icon" variant="ghost" aria-label="Close personalization"><X /></Button></div>
    <p className="panel-intro">Your words and photos stay in this browser on this device.</p>
    <div className="personal-fields"><Field label="Your name" value={story.from} placeholder="How should the note be signed?" onChange={(v) => update("from", v)} /><Field label="Her name" value={story.name} placeholder="The birthday girl’s name" onChange={(v) => update("name", v)} /><Field label="What you call her" value={story.nickname} placeholder="A favourite nickname" onChange={(v) => update("nickname", v)} /><Field area label="A few words about her" value={story.about} placeholder="What makes her wonderfully herself?" onChange={(v) => update("about", v)} /><Field area label="A birthday letter" value={story.letter} placeholder="Write a note she’ll want to keep…" onChange={(v) => update("letter", v)} /><Field area label="Your birthday wish" value={story.wish} placeholder="The words you want her to remember…" onChange={(v) => update("wish", v)} /></div>
    <div className="media-section"><div className="panel-section-title"><span>Photographs</span><span>{story.photos.length} / 10</span></div><p>Add real moments. Photos are kept on this device.</p><div className="photo-tools">{story.photos.map((photo, i) => <span className="photo-chip" key={`${photo.name}-${i}`}><img src={photo.src} alt="" /><button type="button" aria-label={`Remove ${photo.name || `photo ${i + 1}`}`} onClick={() => onStory({ ...story, photos: story.photos.filter((_, j) => j !== i) })}><X /></button></span>)}{story.photos.length < 10 && <label className="upload-photo"><ImagePlus /><span>Add photos</span><input accept="image/*" multiple onChange={onPhotos} type="file" /></label>}</div></div>
    <div className="media-section"><div className="panel-section-title"><span>Sound & film</span></div><p>A song to accompany the story, and a personal video for its final chapter.</p><div className="media-upload-row"><Upload icon={<Music2 />} label={musicReady ? "Change song" : "Add background song"} help={musicReady ? "Ready to play" : "Begins when she opens the story"} ready={musicReady} onChange={onMusic} accept="audio/*" /><Upload icon={<Play />} label={videoReady ? "Change birthday video" : "Add birthday video"} help={videoReady ? "Ready for the last chapter" : "Only plays when she chooses"} ready={videoReady} onChange={onVideo} accept="video/*" /></div></div>
    {notice && <p className="media-message" aria-live="polite">{notice}</p>}<Button className="cinema-button panel-done" onClick={onClose}><Check /> Keep these details</Button>
  </aside></div>;
}
function Field({ label, value, placeholder, onChange, area = false }: { label: string; value: string; placeholder: string; onChange: (value: string) => void; area?: boolean }) { return <label>{label}{area ? <textarea rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /> : <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}</label>; }
function Upload({ icon, label, help, ready, onChange, accept }: { icon: ReactNode; label: string; help: string; ready: boolean; onChange: (event: ChangeEvent<HTMLInputElement>) => void; accept: string }) { return <label className="upload-media">{icon}<span>{label}<small>{help}</small></span><Check className={ready ? "ready" : "not-ready"} /><input type="file" accept={accept} onChange={onChange} /></label>; }
function Lightbox({ photo, onClose, onPrevious, onNext }: { photo: Photo; onClose: () => void; onPrevious: () => void; onNext: () => void }) { return <div className="lightbox" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><Button className="lightbox-close" onClick={onClose} size="icon" variant="ghost" aria-label="Close photograph"><X /></Button><Button onClick={onPrevious} size="icon" variant="ghost" aria-label="Previous photograph"><ChevronLeft /></Button><figure><img src={photo.src} alt={photo.name || "Personal photograph"} /><figcaption>{photo.name}</figcaption></figure><Button onClick={onNext} size="icon" variant="ghost" aria-label="Next photograph"><ChevronRight /></Button></div>; }
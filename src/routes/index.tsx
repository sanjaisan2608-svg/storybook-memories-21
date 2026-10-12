import { useCallback, useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent, type ReactNode, type TouchEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, AudioLines, Camera, Check, ChevronLeft, ChevronRight, Heart, ImagePlus, Music2, Pause, Play, Settings2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import rose from "@/assets/midnight-rose.jpg";

const chapters = ["The invitation", "The birthday", "The person", "Her photographs", "Your favorite song", "What makes her special", "A letter", "The surprise", "One last surprise"];
type Photo = { src: string; name: string };
type Story = { name: string; nickname: string; from: string; about: string; letter: string; lyrics: string; wish: string; photos: Photo[] };
type CloudStory = { story: Story; backgroundMusic: string; favoriteSong: string; video: string };
const defaultLetter = `என் அன்பானவளே,

சில மனிதர்கள் நம் வாழ்க்கையில் வரும்போது, வாழ்க்கையே இன்னும் அழகாக மாறிவிடுகிறது. அப்படிப்பட்ட ஒரு அழகான வரம் நீ!

உன் சிரிப்பில் ஏதோ ஒரு மாயம் இருக்கிறது… கவலையோடு இருக்கும் ஒரு நாளைக்கூட அழகான நாளாக மாற்றிவிடும் மாயம். உன் கண்களில் ஒரு தனி அழகு இருக்கிறது; உன் வார்த்தைகளில் ஒரு தனி அன்பு இருக்கிறது; உன் மனதில் மற்றவர்களை நினைத்துப் பார்க்கும் ஒரு அழகான குணம் இருக்கிறது.

உன்னுடைய அழகு உன் முகத்தில் மட்டும் இல்லை… நீ பேசும் விதத்தில், நீ சிரிக்கும் விதத்தில், மற்றவர்களை நீ நடத்தும் விதத்தில், யாருக்கும் தெரியாமல் நீ காட்டும் அன்பிலும்தான் இருக்கிறது.

நீ எப்போதும் வலிமையாக இருக்க வேண்டிய அவசியமில்லை. சில நாட்களில் சோர்ந்து போனாலும் பரவாயில்லை. எல்லோருக்காகவும் சிரிக்கும் நீயும், சில நேரங்களில் மனதாரச் சிரிக்க யாரோ ஒருவரின் அன்பு தேவைப்படும் ஒரு அழகான மனம்தான். உன்னுடைய உணர்வுகளுக்கும், உன்னுடைய கனவுகளுக்கும், உன்னுடைய சின்னச் சின்ன ஆசைகளுக்கும் எப்போதும் மதிப்பு இருக்கிறது.

உனக்குத் தெரியுமா?

இந்த உலகத்தில் உன்னைப் போல இன்னொருவர் இருக்க முடியாது. உன் சிரிப்பு, உன் குறும்புகள், உன் கோபம், உன் குழந்தைத்தனமான தருணங்கள், உன் அன்பு… இவை எல்லாமே உன்னை நீயாக மாற்றும் அழகான விஷயங்கள்.

இந்தப் பிறந்தநாளில், நீ மற்றவர்களுக்குக் கொடுக்கும் அன்பை விட அதிகமான அன்பு உனக்குக் கிடைக்கட்டும். நீ மனதிற்குள் வைத்திருக்கும் கனவுகள் நனவாகட்டும். உன் கண்ணீருக்குப் பதிலாகச் சிரிப்பும், உன் கவலைகளுக்குப் பதிலாக நிம்மதியும், உன் வாழ்க்கையின் ஒவ்வொரு நாளிலும் அழகான நினைவுகளும் நிறைந்திருக்கட்டும்.

நீ எவ்வளவு சிறப்பானவள் என்பதை நீ ஒருபோதும் மறந்துவிடாதே. உன்னை நீயே நேசிக்கக் கற்றுக்கொள். ஏனென்றால், இந்த உலகத்திற்கு நீ தரும் அழகான விஷயங்களில் ஒன்றே — நீ நீயாக இருப்பதுதான். ❤️

உன் வாழ்க்கை ஒரு அழகான கவிதையாகவும், உன் ஒவ்வொரு நாளும் ஒரு இனிய நினைவாகவும், உன் எதிர்காலம் நீ கனவு கண்டதைவிட அழகாகவும் அமையட்டும்.

இனிய பிறந்தநாள் வாழ்த்துகள், என் அழகிய தேவதையே! 🎂✨

என்றும் அன்புடன்,

உன்னை மனதார வாழ்த்தும் நான்…❤️`;
const blank: Story = { name: "", nickname: "", from: "", about: "", letter: defaultLetter, lyrics: "", wish: "", photos: [] };

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "A Birthday Story — Made Just for You" },
    { name: "description", content: "A private, cinematic birthday story made to celebrate someone wonderful." },
    { property: "og:title", content: "A Birthday Story — Made Just for You" },
    { property: "og:description", content: "Nine little chapters, made to celebrate someone wonderful." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: BirthdayStory,
});

function BirthdayStory() {
  const [story, setStory] = useState<Story>(blank);
  const [storyLoaded, setStoryLoaded] = useState(false);
  const [page, setPage] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<"forward" | "backward">("forward");
  const [settings, setSettings] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [music, setMusic] = useState("");
  const [favoriteSong, setFavoriteSong] = useState("");
  const [video, setVideo] = useState("");
  const [playing, setPlaying] = useState(false);
  const [favoriteSongPlaying, setFavoriteSongPlaying] = useState(false);
  const [favoriteSongTime, setFavoriteSongTime] = useState(0);
  const [favoriteSongDuration, setFavoriteSongDuration] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [notice, setNotice] = useState("");
  const [cloudUser, setCloudUser] = useState<string | null>(null);
  const [cloudReady, setCloudReady] = useState(!supabaseConfigured);
  const [cloudLoadFailed, setCloudLoadFailed] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const favoriteAudio = useRef<HTMLAudioElement | null>(null);
  const backgroundWasPlayingBeforeFavorite = useRef(false);
  const backgroundWasPlayingBeforeVideo = useRef(false);
  const videoPlaybackActive = useRef(false);
  const cloudSaveSequence = useRef(0);
  const touchX = useRef<number | null>(null);
  const go = useCallback((value: number) => {
    const nextPage = Math.max(0, Math.min(chapters.length - 1, value));
    setTransitionDirection(nextPage >= page ? "forward" : "backward");
    setPage(nextPage);
  }, [page]);

  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) setNotice("Your creator sign-in could not be checked.");
      if (!cancelled) {
        setCloudUser(data.session?.user.email ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCloudUser(session?.user.email ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      let savedStory = blank;
      let legacyPhotos: Photo[] = [];

      try {
        const text = localStorage.getItem("birthday-story-text-v1");
        const legacy = localStorage.getItem("birthday-story-v1");
        const saved: Partial<Story> = JSON.parse(text ?? legacy ?? "{}");
        const oldPhotos = localStorage.getItem("birthday-story-photos-v1");

        legacyPhotos = oldPhotos
          ? JSON.parse(oldPhotos)
          : saved.photos ?? [];

        savedStory = {
          ...blank,
          ...saved,
          letter: saved.letter || defaultLetter,
          photos: Array.isArray(legacyPhotos) ? legacyPhotos : [],
        };
      } catch {
        setNotice("Saved details could not be restored.");
      }

      try {
        const persistedPhotos = await readPersistentValue<Photo[]>("photos");

        if (Array.isArray(persistedPhotos)) {
          savedStory = { ...savedStory, photos: persistedPhotos };
        } else if (legacyPhotos.length) {
          await writePersistentValue("photos", legacyPhotos);
          localStorage.removeItem("birthday-story-photos-v1");
        }
      } catch {
        setNotice("Saved photos could not be restored from this device.");
      }

      try {
        const [backgroundBlob, favoriteSongBlob, birthdayVideoBlob] =
          await Promise.all([
            readPersistentValue<Blob>("background-song"),
            readPersistentValue<Blob>("favorite-song"),
            readPersistentValue<Blob>("birthday-video"),
          ]);

        if (!cancelled) {
          if (backgroundBlob) setMusic(URL.createObjectURL(backgroundBlob));
          if (favoriteSongBlob) {
            setFavoriteSong(URL.createObjectURL(favoriteSongBlob));
          }
          if (birthdayVideoBlob) setVideo(URL.createObjectURL(birthdayVideoBlob));
        }
      } catch {
        setNotice("Uploaded audio or video could not be restored from this device.");
      }

      if (supabase) {
        const { data, error } = await supabase
          .from("birthday_stories")
          .select("payload")
          .eq("id", "main")
          .maybeSingle();

        if (error) {
          setCloudLoadFailed(true);
          setNotice(
            "The shared story could not be loaded from the cloud. Showing this device's saved copy.",
          );
        } else if (data?.payload) {
          const payload = data.payload as Partial<CloudStory>;

          if (payload.story) {
            savedStory = {
              ...blank,
              ...payload.story,
              photos: Array.isArray(payload.story.photos)
                ? payload.story.photos
                : [],
            };
          }

          if (!cancelled) {
            setMusic(payload.backgroundMusic ?? "");
            setFavoriteSong(payload.favoriteSong ?? "");
            setVideo(payload.video ?? "");
          }
        }
      }

      if (!cancelled) {
        setStory(savedStory);
        setStoryLoaded(true);
        setCloudReady(true);
      }
    };

    void restore();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!storyLoaded) return;

    const { photos: _photos, ...text } = story;

    try {
      localStorage.setItem("birthday-story-text-v1", JSON.stringify(text));
    } catch {
      setNotice("Your details could not be saved on this device.");
    }
  }, [story, storyLoaded]);

  useEffect(() => {
    if (!storyLoaded) return;

    void writePersistentValue("photos", story.photos)
      .then(() => {
        localStorage.removeItem("birthday-story-photos-v1");
      })
      .catch(() => setNotice("Your photos could not be saved on this device."));
  }, [story.photos, storyLoaded]);

  useEffect(() => {
    const cloudClient = supabase;

    if (
      !cloudClient ||
      !cloudUser ||
      !cloudReady ||
      cloudLoadFailed ||
      !storyLoaded
    ) {
      return;
    }

    const saveId = ++cloudSaveSequence.current;

    const timeout = window.setTimeout(() => {
      void (async () => {
        try {
          const syncedPhotos = await Promise.all(
            story.photos.map(async (photo) => {
              if (!photo.src.startsWith("data:")) return photo;

              const blob = await fetch(photo.src).then((response) =>
                response.blob(),
              );

              const src = await uploadCloudAsset(
                blob,
                `photos/${crypto.randomUUID()}.jpg`,
              );

              return { ...photo, src };
            }),
          );

          const syncMedia = async (
            src: string,
            key: string,
            path: string,
          ) => {
            if (!src.startsWith("blob:")) return src;

            const blob = await readPersistentValue<Blob>(key);

            if (!blob) {
              throw new Error(
                "A selected media file is missing from this device. Please upload it again.",
              );
            }

            return uploadCloudAsset(blob, `${path}/${crypto.randomUUID()}`);
          };

          const [backgroundMusic, syncedFavoriteSong, syncedVideo] =
            await Promise.all([
              syncMedia(music, "background-song", "audio/background"),
              syncMedia(favoriteSong, "favorite-song", "audio/favorite"),
              syncMedia(video, "birthday-video", "video"),
            ]);

          if (saveId !== cloudSaveSequence.current) return;

          const syncedStory = { ...story, photos: syncedPhotos };

          const { error } = await cloudClient
            .from("birthday_stories")
            .upsert({
              id: "main",
              payload: {
                story: syncedStory,
                backgroundMusic,
                favoriteSong: syncedFavoriteSong,
                video: syncedVideo,
              } satisfies CloudStory,
              updated_at: new Date().toISOString(),
            });

          if (error) throw error;

          if (
            syncedPhotos.some(
              (photo, index) => photo.src !== story.photos[index]?.src,
            )
          ) {
            setStory(syncedStory);
          }

          if (backgroundMusic !== music) setMusic(backgroundMusic);
          if (syncedFavoriteSong !== favoriteSong) {
            setFavoriteSong(syncedFavoriteSong);
          }
          if (syncedVideo !== video) setVideo(syncedVideo);

          setNotice("Your story is saved to your cloud account.");
        } catch (error) {
          if (saveId === cloudSaveSequence.current) {
            console.error("Cloud story sync failed:", error);
            setNotice(
              error instanceof Error
                ? `Cloud sync failed: ${error.message}`
                : "Cloud sync failed. Please try again.",
            );
          }
        }
      })();
    }, 800);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    story,
    music,
    favoriteSong,
    video,
    cloudUser,
    cloudReady,
    cloudLoadFailed,
    storyLoaded,
  ]);

  useEffect(() => {
    if (!music) return;
    const player = new Audio(music); player.loop = true; player.volume = 0; audio.current = player;
    const onPlay = () => {
      backgroundWasPlayingBeforeFavorite.current = false;
      if (favoriteAudio.current && !favoriteAudio.current.paused) {
        favoriteAudio.current.pause();
        setFavoriteSongPlaying(false);
      }
      setPlaying(true);
    };
    const onPause = () => setPlaying(false);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    return () => {
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.pause();
      audio.current = null;
      if (music.startsWith("blob:")) URL.revokeObjectURL(music);
    };
  }, [music]);
  useEffect(() => {
    if (!favoriteSong) return;
    const player = new Audio(favoriteSong); player.loop = true; player.volume = .28; favoriteAudio.current = player;
    const updateTime = () => setFavoriteSongTime(player.currentTime);
    const updateDuration = () => setFavoriteSongDuration(Number.isFinite(player.duration) ? player.duration : 0);
    const onPlay = () => {
      const backgroundPlayer = audio.current;
      if (backgroundPlayer && !backgroundPlayer.paused) {
        backgroundWasPlayingBeforeFavorite.current = true;
        backgroundPlayer.pause();
      }
      setFavoriteSongPlaying(true);
    };
    const onPause = () => setFavoriteSongPlaying(false);
    player.addEventListener("timeupdate", updateTime);
    player.addEventListener("loadedmetadata", updateDuration);
    player.addEventListener("durationchange", updateDuration);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    updateDuration();
    return () => {
      player.removeEventListener("timeupdate", updateTime);
      player.removeEventListener("loadedmetadata", updateDuration);
      player.removeEventListener("durationchange", updateDuration);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.pause();
      favoriteAudio.current = null;
      if (favoriteSong.startsWith("blob:")) URL.revokeObjectURL(favoriteSong);
    };
  }, [favoriteSong]);
  useEffect(() => () => {
    if (video.startsWith("blob:")) URL.revokeObjectURL(video);
  }, [video]);
  const resumeBackgroundAfterFavorite = useCallback(() => {
    if (!backgroundWasPlayingBeforeFavorite.current) return;
    backgroundWasPlayingBeforeFavorite.current = false;
    const player = audio.current;
    if (!player) return;
    player.volume = .28;
    player.play().then(() => {
      setPlaying(true);
      setNotice("");
    }).catch(() => {
      setPlaying(false);
      setNotice("The background song could not be resumed. Please try playing it again.");
    });
  }, []);
  const pauseBackgroundForVideo = useCallback(() => {
    videoPlaybackActive.current = true;
    setVideoPlaying(true);
    const player = audio.current;
    if (player && !player.paused) {
      backgroundWasPlayingBeforeVideo.current = true;
      player.pause();
    }
  }, []);
  const resumeBackgroundAfterVideo = useCallback(() => {
    videoPlaybackActive.current = false;
    setVideoPlaying(false);
    if (!backgroundWasPlayingBeforeVideo.current) return;
    const player = audio.current;
    if (!player) {
      backgroundWasPlayingBeforeVideo.current = false;
      return;
    }
    player.volume = .28;
    player.play().then(() => {
      if (videoPlaybackActive.current) {
        player.pause();
        return;
      }
      backgroundWasPlayingBeforeVideo.current = false;
      setPlaying(true);
      setNotice("");
    }).catch(() => {
      if (videoPlaybackActive.current) return;
      backgroundWasPlayingBeforeVideo.current = false;
      setPlaying(false);
      setNotice("The background song could not be resumed. Please try playing it again.");
    });
  }, []);
  useEffect(() => {
    if (page === 4) return;
    favoriteAudio.current?.pause();
    setFavoriteSongPlaying(false);
    resumeBackgroundAfterFavorite();
  }, [page, resumeBackgroundAfterFavorite]);
  useEffect(() => {
    if (page !== 8 && videoPlaybackActive.current) resumeBackgroundAfterVideo();
  }, [page, resumeBackgroundAfterVideo]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setSettings(false); setLightbox(null); }
      if (!settings && lightbox === null && event.key === "ArrowRight") go(page + 1);
      if (!settings && lightbox === null && event.key === "ArrowLeft") go(page - 1);
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [settings, lightbox, go, page]);

  const name = story.name.trim() || "beautiful soul";
  const start = () => {
    go(1);
    const player = audio.current;
    if (!player) return;
    player.currentTime = 0;
    player.volume = 0;
    player.play().then(() => {
      setPlaying(true);
      setNotice("");
      let volume = 0;
      const fade = window.setInterval(() => {
        volume = Math.min(.28, volume + .01);
        if (audio.current) audio.current.volume = volume;
        if (volume >= .28) window.clearInterval(fade);
      }, 72);
    }).catch(() => {
      setPlaying(false);
      setNotice("The song could not be played. Please choose another audio file.");
    });
  };
  const toggleMusic = () => {
    if (videoPlaybackActive.current) return;
    const player = audio.current;
    if (!player) { setSettings(true); return; }
    if (player.paused) {
      backgroundWasPlayingBeforeFavorite.current = false;
      if (favoriteAudio.current && !favoriteAudio.current.paused) {
        favoriteAudio.current.pause();
        setFavoriteSongPlaying(false);
      }
      player.volume = .28;
      player.play().then(() => { setPlaying(true); setNotice(""); }).catch(() => { setPlaying(false); setNotice("The song could not be played. Please choose another audio file."); });
    }
    else { player.pause(); setPlaying(false); }
  };
  const toggleFavoriteSong = () => {
    const player = favoriteAudio.current;
    if (!player) { setSettings(true); return; }
    if (player.paused) {
      const backgroundPlayer = audio.current;
      backgroundWasPlayingBeforeFavorite.current = Boolean(backgroundPlayer && !backgroundPlayer.paused);
      if (backgroundWasPlayingBeforeFavorite.current && backgroundPlayer) {
        backgroundPlayer.pause();
        setPlaying(false);
      }
      player.play().then(() => { setFavoriteSongPlaying(true); setNotice(""); }).catch(() => {
        setFavoriteSongPlaying(false);
        setNotice("Her favorite song could not be played. Please choose another audio file.");
        resumeBackgroundAfterFavorite();
      });
    } else {
      player.pause();
      setFavoriteSongPlaying(false);
      resumeBackgroundAfterFavorite();
    }
  };
  const signIn = async (email: string, password: string) => {
    if (!supabase) return setNotice("Cloud sign-in is not configured for this deployment.");
    setNotice("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };
  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setNotice(`Could not sign out: ${error.message}`);
  };
  const addPhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.currentTarget.files ?? []).slice(0, 10 - story.photos.length);
    const added: Photo[] = [];
    for (const file of selected) try { added.push({ src: await shrink(file), name: file.name.replace(/\.[^.]+$/, "") }); }
    catch { setNotice("One photo could not be opened. Please try another image."); }
    if (added.length) { setStory((s) => ({ ...s, photos: [...s.photos, ...added].slice(0, 10) })); setNotice(`${added.length} photo${added.length === 1 ? "" : "s"} added.`); }
    event.currentTarget.value = "";
  };
  const addMusic = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    try {
      await writePersistentValue("background-song", file);
      setMusic(URL.createObjectURL(file)); setPlaying(false); setNotice("Your background song is saved on this device.");
    } catch { setNotice("Your background song could not be saved. Check available browser storage and try again."); }
  };
  const addFavoriteSong = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    try {
      await writePersistentValue("favorite-song", file);
      setFavoriteSong(URL.createObjectURL(file)); setFavoriteSongTime(0); setFavoriteSongDuration(0); setFavoriteSongPlaying(false); setNotice("Her favorite song is saved on this device.");
    } catch { setNotice("Her favorite song could not be saved. Check available browser storage and try again."); }
  };
  const addVideo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    try {
      await writePersistentValue("birthday-video", file);
      setVideo(URL.createObjectURL(file)); setFinished(false); setNotice("Your birthday video is saved on this device.");
    } catch { setNotice("Your birthday video could not be saved. Check available browser storage and try again."); }
  };
  const touchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchX.current === null) return;
    const x = event.changedTouches[0]?.clientX;
    if (x !== undefined && Math.abs(x - touchX.current) > 75) go(page + (x < touchX.current ? 1 : -1));
    touchX.current = null;
  };

  return <div className="birthday-app" onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null; }} onTouchEnd={touchEnd}>
    <div className="film-grain" aria-hidden="true" />
    <div className="heart-drift" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <span key={i}>{i % 3 === 1 ? "♡" : "♥"}</span>)}</div>
    <header className="story-header">
      <a className="wordmark" href="/" aria-label="A birthday story"><Heart /> <span>For you, always</span></a>
      <nav className="chapter-progress" aria-label="Story chapters">{chapters.map((chapter, i) => <button type="button" key={chapter} title={chapter} aria-label={`Chapter ${i + 1}: ${chapter}`} aria-current={page === i ? "step" : undefined} className={`progress-line${page === i ? " active" : ""}${page > i ? " past" : ""}`} onClick={() => go(i)} />)}</nav>
      <Button className="settings-trigger" onClick={() => setSettings(true)} size="icon" variant="ghost" title="Personalize this story" aria-label="Personalize this story"><Settings2 /></Button>
    </header>
    <main className="chapter-stage" aria-live="polite"><section className={`chapter chapter-${page + 1} chapter-enter-${transitionDirection}`} key={page}>
      {page === 0 && <Opening onStart={start} />}
      {page === 1 && <Birthday name={name} photo={story.photos[0]} onAdd={() => setSettings(true)} />}
      {page === 2 && <About story={story} name={name} onPhoto={(i) => story.photos[i] && setLightbox(i)} onAdd={() => setSettings(true)} />}
      {page === 3 && <Gallery photos={story.photos} onPhoto={setLightbox} onAdd={() => setSettings(true)} />}
      {page === 4 && <SongChapter lyrics={story.lyrics} musicReady={Boolean(favoriteSong)} playing={favoriteSongPlaying} currentTime={favoriteSongTime} duration={favoriteSongDuration} onAdd={() => setSettings(true)} onToggleMusic={toggleFavoriteSong} />}
       {page === 5 && <Qualities expanded={expanded} onToggle={setExpanded} />}
      {page === 6 && <Letter story={story} />}
      {page === 7 && <BirthdaySurprise name={name} />}
      {page === 8 && <Final story={story} name={name} video={video} finished={finished} onVideoPlay={pauseBackgroundForVideo} onVideoPause={resumeBackgroundAfterVideo} onEnded={() => setFinished(true)} onAdd={() => setSettings(true)} onReplay={() => { setFinished(false); go(0); }} />}
    </section></main>
    {page > 0 && <footer className="story-footer">
      <Button className="nav-control" onClick={() => go(page - 1)} variant="ghost"><ArrowLeft /> <span>Back</span></Button>
      <span className="chapter-count">{String(page + 1).padStart(2, "0")} <i>/</i> {String(chapters.length).padStart(2, "0")}</span>
      <div className="footer-actions">
        <Button className={`music-control${playing ? " is-playing" : ""}`} onClick={toggleMusic} disabled={videoPlaying} size="icon" variant="ghost" aria-label={playing ? "Pause background song" : music ? "Play background song" : "Add a background song"} title={videoPlaying ? "Background music is paused while the video plays" : playing ? "Pause background song" : music ? "Play background song" : "Add a background song"}>{playing ? <AudioLines /> : <Music2 />}</Button>
        <Button className="nav-control nav-next" onClick={() => page < chapters.length - 1 ? go(page + 1) : go(0)} variant="ghost"><span>{page < chapters.length - 1 ? "Next" : "Again"}</span>{page < chapters.length - 1 ? <ArrowRight /> : <Heart />}</Button>
      </div>
    </footer>}
    {settings && <Personalize story={story} notice={notice} cloudEnabled={supabaseConfigured} cloudUser={cloudUser} cloudReady={cloudReady} backgroundMusicReady={Boolean(music)} favoriteSongReady={Boolean(favoriteSong)} videoReady={Boolean(video)} onSignIn={signIn} onSignOut={signOut} onStory={setStory} onPhotos={addPhotos} onMusic={addMusic} onFavoriteSong={addFavoriteSong} onVideo={addVideo} onClose={() => setSettings(false)} />}
    {lightbox !== null && story.photos[lightbox] && <Lightbox photo={story.photos[lightbox]} onClose={() => setLightbox(null)} onPrevious={() => setLightbox((lightbox - 1 + story.photos.length) % story.photos.length)} onNext={() => setLightbox((lightbox + 1) % story.photos.length)} />}
  </div>;
}

const persistenceDatabase = "birthday-story-persistence";
const persistenceStore = "saved-content";

function openPersistenceDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("Persistent browser storage is unavailable."));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(persistenceDatabase, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(persistenceStore)) request.result.createObjectStore(persistenceStore);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open persistent browser storage."));
    request.onblocked = () => reject(new Error("Persistent browser storage is blocked by another tab."));
  });
}

async function readPersistentValue<T>(key: string): Promise<T | undefined> {
  const database = await openPersistenceDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(persistenceStore, "readonly");
    const request = transaction.objectStore(persistenceStore).get(key);
    let value: T | undefined;
    request.onsuccess = () => { value = request.result as T | undefined; };
    transaction.oncomplete = () => { database.close(); resolve(value); };
    transaction.onerror = () => { database.close(); reject(transaction.error ?? new Error("Could not read saved content.")); };
    transaction.onabort = () => { database.close(); reject(transaction.error ?? new Error("Reading saved content was interrupted.")); };
  });
}

async function writePersistentValue(key: string, value: Blob | Photo[]): Promise<void> {
  const database = await openPersistenceDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(persistenceStore, "readwrite");
    transaction.objectStore(persistenceStore).put(value, key);
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error ?? new Error("Could not save content.")); };
    transaction.onabort = () => { database.close(); reject(transaction.error ?? new Error("Saving content was interrupted.")); };
  });
}

async function uploadCloudAsset(file: Blob, path: string): Promise<string> {
  if (!supabase) throw new Error("Cloud storage is not configured.");
  const { error } = await supabase.storage.from("birthday-assets").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });
  if (error) throw error;
  return supabase.storage.from("birthday-assets").getPublicUrl(path).data.publicUrl;
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
  <div className="opening-copy"><Eyebrow>A little something made just for you</Eyebrow><h1>Hi Kamali💕<span>.</span></h1><p>I made something special for you.</p><Button className="cinema-button" onClick={onStart}>Open your birthday surprise <ArrowRight /></Button></div>
  <span className="opening-caption">A story in nine little chapters</span>
</div>; }
function Eyebrow({ children }: { children: ReactNode }) { return <span className="eyebrow"><i />{children}</span>; }

function BirthdaySurprise({ name }: { name: string }) {
  const [revealed, setRevealed] = useState(false);
  return <div className={`birthday-surprise${revealed ? " is-revealed" : ""}`}>
    {revealed && <div className="birthday-confetti" aria-hidden="true">{Array.from({ length: 110 }, (_, i) => {
      const drift = ((i * 47) % 481) - 240;
      const style = {
        left: `${(i * 73 + i * i * 19) % 100}%`,
        top: `${(i * 47 + i * i * 13) % 96}%`,
        animationDelay: `${((i * 37) % 13) / 100}s`,
        animationDuration: `${1.8 + ((i * 17) % 10) / 10}s`,
        "--confetti-mid-drift": `${drift * 0.35}px`,
        "--confetti-side-drift": `${drift * -0.2}px`,
        "--confetti-drift": `${drift}px`,
        "--confetti-fall": `${88 + ((i * 29) % 41)}vh`,
        "--confetti-spin": `${((i * 83) % 1441) - 720}deg`,
        backgroundColor: ["var(--cinema-pink)", "var(--cinema-gold)", "var(--cinema-blush)", "oklch(0.73 0.09 53)"][i % 4],
      } as CSSProperties & Record<`--confetti-${"mid-drift" | "side-drift" | "drift" | "fall" | "spin"}`, string>;
      return <span key={i} style={style} />;
    })}</div>}
    <div className="surprise-content" aria-live="polite">
      <Eyebrow>A little surprise for you</Eyebrow>
      {!revealed ? <>
        <h2>Ready for your<br /><em>surprise?</em></h2>
        <p>There is one more birthday wish waiting just for you.</p>
        <Button className="cinema-button surprise-button" onClick={() => setRevealed(true)}><Sparkles /> Open your surprise</Button>
      </> : <>
        <Heart className="surprise-heart" aria-hidden="true" />
        <h2>Happy Birthday,<br /><em>{name}!</em></h2>
        <p>May your day be filled with love, laughter, and all the happiness you deserve.</p>
      </>}
    </div>
  </div>;
}

function Birthday({ name, photo, onAdd }: { name: string; photo: Photo | undefined; onAdd: () => void }) { return <div className="birthday-layout">
  <div className="birthday-copy"><Eyebrow>Today is all about you</Eyebrow><h2>Happy<br />Birthday<span>,</span></h2><p className="birthday-name">{name}</p><p className="chapter-description">Today is a lovely reason to celebrate the person you are—and all the moments still waiting for you.</p></div>
  <figure className={`birthday-portrait${photo ? " has-photo" : ""}`}>{photo ? <img src={photo.src} alt={photo.name || "A favourite photograph"} /> : <button className="portrait-invitation" onClick={onAdd} type="button"><Camera /><span>A favourite photo<br />belongs here</span><small><ImagePlus /> Add your photos</small></button>}<figcaption>one of a kind, every day</figcaption></figure>
</div>; }

function About({ story, name, onPhoto, onAdd }: { story: Story; name: string; onPhoto: (index: number) => void; onAdd: () => void }) { return <div className="about-layout">
  <div className="about-copy"><Eyebrow>The person behind the smile</Eyebrow><h2>There is something<br />beautiful about <em>{name}</em></h2><p>{story.about || "A whole chapter for the little things, the big things, and everything that makes her unmistakably herself."}</p></div>
  <div className="about-collage" aria-label="A personal photo portrait collage">{[0, 1, 2, 3].map((i) => <button className={`collage-photo collage-${i + 1}`} key={i} onClick={() => story.photos[i] ? onPhoto(i) : onAdd()} type="button" aria-label={story.photos[i] ? `View ${story.photos[i]?.name || "photograph"}` : "Add a personal photograph"}>{story.photos[i] ? <img src={story.photos[i]?.src} alt={story.photos[i]?.name || "Personal memory"} /> : <ImagePlus />}</button>)}</div>
</div>; }

function Gallery({ photos, onPhoto, onAdd }: { photos: Photo[]; onPhoto: (index: number) => void; onAdd: () => void }) { return <div className="gallery-layout">
  <div className="chapter-heading gallery-heading"><Eyebrow>A collection of beautiful moments</Eyebrow><h2>Just <em>her.</em></h2><p>Every photograph holds a little piece of a story.</p></div>
  <div className="photo-montage">{photos.length ? photos.map((photo, i) => <button className={`montage-frame montage-${i % 10 + 1}`} key={`${photo.name}-${i}`} onClick={() => onPhoto(i)} type="button" aria-label={`Open photograph ${i + 1}`}><img src={photo.src} alt={photo.name || `Personal photograph ${i + 1}`} loading="lazy" /></button>) : <button className="montage-frame montage-empty" onClick={onAdd} type="button" aria-label="Add a photograph"><span><ImagePlus /><i>Add your photographs</i></span></button>}</div>
  <span className="gallery-count">{String(photos.length).padStart(2, "0")} <i>photographs</i></span>
</div>; }

function SongChapter({ lyrics, musicReady, playing, currentTime, duration, onAdd, onToggleMusic }: { lyrics: string; musicReady: boolean; playing: boolean; currentTime: number; duration: number; onAdd: () => void; onToggleMusic: () => void }) {
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const lyricsPanel = useRef<HTMLParagraphElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lyricParts = lyrics.split(/(\s+)/u);
  const wordCount = lyricParts.filter((part) => part && !/^\s+$/u.test(part)).length;
  const activeWord = duration > 0 && wordCount > 0
    ? Math.min(wordCount - 1, Math.floor((currentTime / duration) * wordCount))
    : -1;
  useEffect(() => {
    if (playing && lyrics.trim()) setLyricsOpen(true);
  }, [playing, lyrics]);
  useEffect(() => {
    if (activeWord < 0) return;
    const word = wordRefs.current[activeWord];
    const panel = lyricsPanel.current;
    if (!word || !panel) return;
    const wordTop = word.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop;
    const wordBottom = wordTop + word.getBoundingClientRect().height;
    if (wordTop < panel.scrollTop || wordBottom > panel.scrollTop + panel.clientHeight) {
      panel.scrollTo({ top: wordTop - panel.clientHeight / 2, behavior: "smooth" });
    }
  }, [activeWord, lyricsOpen]);
  return <div className="song-layout">
    <div className="song-copy">
      <Eyebrow>A song that feels like her</Eyebrow>
      <h2>Your favorite<br /><em>song.</em></h2>
      <p>Some songs hold a thousand memories. This one is for all the little moments that make her, her.</p>
      <Button className={`song-play-button${playing ? " is-playing" : ""}`} onClick={onToggleMusic} aria-pressed={playing}>
        {playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
        {playing ? "Pause her song" : musicReady ? "Play her song" : "Add her favorite song"}
      </Button>
      {lyrics.trim() ? <Button className="song-lyrics-toggle" onClick={() => setLyricsOpen((open) => !open)} aria-expanded={lyricsOpen}>{lyricsOpen ? "Hide lyrics" : "Show lyrics"} <ArrowRight /></Button> : <button className="song-lyrics-empty" onClick={onAdd} type="button">Add lyrics in Personalize <ArrowRight /></button>}
      {lyricsOpen && <p className="song-lyrics" ref={lyricsPanel} aria-live="off">{lyricParts.map((part, index) => {
        if (!part || /^\s+$/u.test(part)) return part;
        const wordIndex = lyricParts.slice(0, index).filter((previous) => previous && !/^\s+$/u.test(previous)).length;
        return <span className="song-lyric-word" key={index} ref={(element) => { wordRefs.current[wordIndex] = element; }}>{part}</span>;
      })}</p>}
    </div>
    <div className={`song-stage${playing ? " is-playing" : ""}`} aria-label={playing ? "Her favorite song is playing" : "Her favorite song player"}>
      <div className="song-vinyl" aria-hidden="true"><Music2 /><span>♪</span></div>
    </div>
  </div>;
}

const qualities = [{ title: "Her smile", text: "The kind of light that finds its way into a room—and stays with you." }, { title: "Her spirit", text: "A one-of-a-kind way of seeing the world, and making it feel a little brighter." }, { title: "Her kindness", text: "A beautiful reminder that the smallest gestures can mean the most." }, { title: "Her laugh", text: "A sound that turns an ordinary moment into one you want to keep." }, { title: "Her strength", text: "Brave, and entirely her own." }, { title: "Simply her", text: "There is no one else quite like her. That is the whole magic." }];
function Qualities({ expanded, onToggle }: { expanded: number | null; onToggle: (index: number | null) => void }) { return <div className="qualities-layout">
  <div className="chapter-heading"><Eyebrow>If I had to describe her…</Eyebrow><h2>What makes her<br /><em>special.</em></h2></div><div className="quality-list">{qualities.map((item, i) => <button className={`quality-item${expanded === i ? " expanded" : ""}`} key={item.title} onClick={() => onToggle(expanded === i ? null : i)} aria-expanded={expanded === i}><span className="quality-number">0{i + 1}</span><span className="quality-text"><strong>{item.title}</strong>{expanded === i && <i>{item.text}</i>}</span><Sparkles /><span className="quality-plus">{expanded === i ? "−" : "+"}</span></button>)}</div>
</div>; }

function Letter({ story }: { story: Story }) { return <div className="letter-layout"><div className="letter-paper">
  <Eyebrow>இதயத்திலிருந்து சில வார்த்தைகள்…</Eyebrow><h2>உனக்காக… என் அழகிய<br /><em>தேவதையே! ❤️</em></h2><div className="letter-rule"><i /><Heart /><i /></div>
  <p className="letter-body">{story.letter || defaultLetter}</p><span className="letter-flower">✳</span>
</div></div>; }

function Final({ story, name, video, finished, onVideoPlay, onVideoPause, onEnded, onAdd, onReplay }: { story: Story; name: string; video: string; finished: boolean; onVideoPlay: () => void; onVideoPause: () => void; onEnded: () => void; onAdd: () => void; onReplay: () => void }) { const favourite = story.photos.at(-1); return <div className={`final-layout${finished ? " final-finished" : ""}`}>
  <div className="final-backdrop">{favourite && <img src={favourite.src} alt="" />}</div>
  {!finished ? <div className="final-content"><Eyebrow>One final thing…</Eyebrow><h2>This one is<br /><em>just for you.</em></h2><p>I wanted to tell you everything through this video.</p>
   {video ? <div className="video-frame"><video controls playsInline preload="metadata" muted={false} src={video} onLoadedMetadata={(event) => { event.currentTarget.defaultMuted = false; event.currentTarget.muted = false; event.currentTarget.volume = 1; }} onPlay={(event) => { event.currentTarget.muted = false; event.currentTarget.volume = 1; onVideoPlay(); }} onPause={onVideoPause} onEnded={onEnded}>Your browser does not support video playback.</video></div> : <button className="video-invitation" onClick={onAdd}><span className="video-play"><Play fill="currentColor" /></span><span>Her birthday film</span><small>Add your personal video</small></button>}
  </div> : <div className="final-content final-message"><Eyebrow>Happy birthday</Eyebrow><h2>Happy Birthday,<br /><em>{name}.</em></h2><p>{story.wish || "You deserve all the happiness, love, and beautiful moments in the world. Here is to everything wonderful still ahead."}</p><p className="final-signature">With love, {story.from.trim() || "always"}</p><Button className="cinema-button" onClick={onReplay}>Replay from the beginning <ArrowLeft /></Button></div>}
</div>; }

function Personalize({ story, notice, cloudEnabled, cloudUser, cloudReady, backgroundMusicReady, favoriteSongReady, videoReady, onSignIn, onSignOut, onStory, onPhotos, onMusic, onFavoriteSong, onVideo, onClose }: { story: Story; notice: string; cloudEnabled: boolean; cloudUser: string | null; cloudReady: boolean; backgroundMusicReady: boolean; favoriteSongReady: boolean; videoReady: boolean; onSignIn: (email: string, password: string) => Promise<void>; onSignOut: () => void; onStory: (value: Story) => void; onPhotos: (event: ChangeEvent<HTMLInputElement>) => void; onMusic: (event: ChangeEvent<HTMLInputElement>) => void; onFavoriteSong: (event: ChangeEvent<HTMLInputElement>) => void; onVideo: (event: ChangeEvent<HTMLInputElement>) => void; onClose: () => void }) {
  const update = (key: keyof Omit<Story, "photos">, value: string) => onStory({ ...story, [key]: value });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState("");
  const submitSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSigningIn(true);
    setSignInError("");
    try { await onSignIn(email, password); }
    catch (error) { setSignInError(error instanceof Error ? error.message : "Sign-in failed. Check your email and password."); }
    finally { setSigningIn(false); }
  };
  return <div className="panel-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><aside className="personalize-panel" role="dialog" aria-modal="true" aria-label="Personalize your birthday story">
    <div className="panel-heading"><div><Eyebrow>A little more personal</Eyebrow><h2>Make it <em>yours.</em></h2></div><Button className="panel-close" onClick={onClose} size="icon" variant="ghost" aria-label="Close personalization"><X /></Button></div>
    {cloudEnabled && !cloudUser ? <div className="cloud-signin">
      <p className="panel-intro">This birthday story is shared for viewing. Sign in with the creator account to edit details and upload photos, songs, and video.</p>
      {!cloudReady && <p className="media-message">Connecting to the shared story…</p>}
      <form onSubmit={(event) => void submitSignIn(event)}>
        <label>Email<input autoComplete="username" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Password<input autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {signInError && <p className="media-message" role="alert">{signInError}</p>}
        <Button className="cinema-button panel-done" disabled={signingIn || !cloudReady} type="submit">{signingIn ? "Signing in…" : "Sign in to edit"}</Button>
      </form>
      {notice && <p className="media-message" aria-live="polite">{notice}</p>}
    </div> : <>
      <p className="panel-intro">{cloudEnabled ? `Signed in as ${cloudUser}. Changes sync across devices.` : "Your details, photos, and songs save automatically in this browser on this device."}</p>
      {cloudEnabled && <Button className="panel-signout" onClick={() => void onSignOut()}>Sign out</Button>}
      <div className="personal-fields"><Field label="Your name" value={story.from} placeholder="How should the story be signed?" onChange={(v) => update("from", v)} /><Field label="Her name" value={story.name} placeholder="The birthday girl’s name" onChange={(v) => update("name", v)} /><Field label="What you call her" value={story.nickname} placeholder="A favourite nickname" onChange={(v) => update("nickname", v)} /><Field area label="A few words about her" value={story.about} placeholder="What makes her wonderfully herself?" onChange={(v) => update("about", v)} /><Field area label="A birthday letter" value={story.letter} placeholder="Write a note she’ll want to keep…" onChange={(v) => update("letter", v)} /><Field area label="Her song lyrics" value={story.lyrics} placeholder="Add a few lyrics or a special verse…" onChange={(v) => update("lyrics", v)} /><Field area label="Your birthday wish" value={story.wish} placeholder="The words you want her to remember…" onChange={(v) => update("wish", v)} /></div>
      <div className="media-section"><div className="panel-section-title"><span>Photographs</span><span>{story.photos.length} / 10</span></div><p>Add real moments. Photos are saved to your cloud account.</p><div className="photo-tools">{story.photos.map((photo, i) => <span className="photo-chip" key={`${photo.name}-${i}`}><img src={photo.src} alt="" /><button type="button" aria-label={`Remove ${photo.name || `photo ${i + 1}`}`} onClick={() => onStory({ ...story, photos: story.photos.filter((_, j) => j !== i) })}><X /></button></span>)}{story.photos.length < 10 && <label className="upload-photo"><ImagePlus /><span>Add photos</span><input accept="image/*" multiple onChange={onPhotos} type="file" /></label>}</div></div>
      <div className="media-section"><div className="panel-section-title"><span>Sound & film</span></div><p>Choose separate songs for the background and her favorite-song chapter. The optional video is for the final chapter.</p><div className="media-upload-row"><Upload icon={<Music2 />} label={backgroundMusicReady ? "Change background song" : "Add background song"} help={backgroundMusicReady ? "Plays throughout the story" : "Starts when her story opens"} ready={backgroundMusicReady} onChange={onMusic} accept="audio/*" /><Upload icon={<Music2 />} label={favoriteSongReady ? "Change her favorite song" : "Add her favorite song"} help={favoriteSongReady ? "Ready for her song chapter" : "Plays only in its chapter"} ready={favoriteSongReady} onChange={onFavoriteSong} accept="audio/*" /><Upload icon={<Play />} label={videoReady ? "Change birthday video" : "Add birthday video"} help={videoReady ? "Ready for the final chapter" : "Only plays when she chooses"} ready={videoReady} onChange={onVideo} accept="video/*" /></div></div>
      {notice && <p className="media-message" aria-live="polite">{notice}</p>}<Button className="cinema-button panel-done" onClick={onClose}><Check /> Keep these details</Button>
    </>}
  </aside></div>;
}
function Field({ label, value, placeholder, onChange, area = false }: { label: string; value: string; placeholder: string; onChange: (value: string) => void; area?: boolean }) { return <label>{label}{area ? <textarea rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /> : <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}</label>; }
function Upload({ icon, label, help, ready, onChange, accept }: { icon: ReactNode; label: string; help: string; ready: boolean; onChange: (event: ChangeEvent<HTMLInputElement>) => void; accept: string }) { return <label className="upload-media">{icon}<span>{label}<small>{help}</small></span><Check className={ready ? "ready" : "not-ready"} /><input type="file" accept={accept} onChange={onChange} /></label>; }
function Lightbox({ photo, onClose, onPrevious, onNext }: { photo: Photo; onClose: () => void; onPrevious: () => void; onNext: () => void }) {
  const caption = /^whatsapp image\b/iu.test(photo.name.trim()) ? "" : photo.name;
  return <div className="lightbox" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><Button className="lightbox-close" onClick={onClose} size="icon" variant="ghost" aria-label="Close photograph"><X /></Button><Button onClick={onPrevious} size="icon" variant="ghost" aria-label="Previous photograph"><ChevronLeft /></Button><figure><img src={photo.src} alt={caption || "Personal photograph"} />{caption && <figcaption>{caption}</figcaption>}</figure><Button onClick={onNext} size="icon" variant="ghost" aria-label="Next photograph"><ChevronRight /></Button></div>;
}
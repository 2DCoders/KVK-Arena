import { useEffect, useRef, type CSSProperties, type ComponentType } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, type LucideProps } from "lucide-react";
import { InstagramOutlined } from "@ant-design/icons";
import "./coming-soon.css";

type ComingSoonProps = {
  name: string;
  logo: string;
  hue: number;
  eyebrow: string;
  icon: ComponentType<LucideProps>;
};

export default function ComingSoon({ name, logo, hue, eyebrow, icon: Icon }: ComingSoonProps) {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.documentElement.classList.add("module-launch-active");
    document.title = `${name} | Coming Soon`;
    window.scrollTo(0, 0);
    return () => {
      document.title = previousTitle;
      document.documentElement.classList.remove("module-launch-active");
    };
  }, [name]);

  return (
    <main className="module-coming-soon" style={{ "--launch-hue": hue } as CSSProperties}>
      <div className="module-launch-haze" aria-hidden="true" />
      <header className="module-launch-header">
        <Link to="/" className="module-launch-brand" aria-label={`${name}, KVK Arena home`}>
          <img src={logo} alt={name} />
        </Link>
        <Link to="/" className="module-launch-back"><ArrowLeft size={16} /><span>Back to Arena</span></Link>
      </header>

      <section className="module-launch-stage" aria-labelledby="module-launch-title"
        onPointerMove={(event) => {
          if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          sceneRef.current?.style.setProperty("--tilt-x", `${(event.clientY - bounds.top - bounds.height / 2) / 45}deg`);
          sceneRef.current?.style.setProperty("--tilt-y", `${(event.clientX - bounds.left - bounds.width / 2) / 45}deg`);
        }}
        onPointerLeave={() => {
          sceneRef.current?.style.setProperty("--tilt-x", "0deg");
          sceneRef.current?.style.setProperty("--tilt-y", "0deg");
        }}>
        <div className="module-launch-scene" ref={sceneRef} aria-hidden="true">
          <div className="module-launch-orbit module-launch-orbit-one" />
          <div className="module-launch-orbit module-launch-orbit-two" />
          <div className="module-launch-orbit module-launch-orbit-three" />
          <div className="module-launch-sculpture">
            <div className="module-launch-medallion">
              <div className="module-launch-medallion-back" />
              <div className="module-launch-medallion-face">
                <Icon className="module-launch-icon-shadow" strokeWidth={1.3} />
                <Icon className="module-launch-icon" strokeWidth={1.3} />
              </div>
            </div>
          </div>
          <i className="module-launch-spark module-launch-spark-one" />
          <i className="module-launch-spark module-launch-spark-two" />
          <i className="module-launch-spark module-launch-spark-three" />
          <div className="module-launch-floor" />
        </div>
        <p className="module-launch-eyebrow"><span /> {eyebrow}</p>
        <h1 id="module-launch-title">COMING <span>SOON.</span></h1>
        <a className="module-launch-follow" href="https://www.instagram.com/kvk_arena" target="_blank" rel="noreferrer"><InstagramOutlined /> Follow the reveal <ArrowUpRight size={15} /></a>
      </section>

      <footer className="module-launch-footer"><span>KVK ARENA</span><span className="module-launch-status"><i /> SOMETHING NEW IS TAKING SHAPE</span><span>{name.toUpperCase()}</span></footer>
    </main>
  );
}


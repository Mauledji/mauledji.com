import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { useMediaQuery } from "react-responsive";
import { expertiseData } from "../../constants/index";
import AnimatedHeaderSection from "../common/AnimatedHeaderSection";

gsap.registerPlugin(ScrollTrigger);

const Expertise: React.FC = () => {
  const text = `
        Building digital experiences through
        scalability, smooth UX, and innovation
        engineering order in the chaos of cosmos
    `;

  const expertiseRef = useRef<(HTMLDivElement | null)[]>([]);
  const isDesktop = useMediaQuery({ minWidth: "48rem" });

  useGSAP(() => {
    expertiseRef.current.forEach((el) => {
      if (!el) return;

      gsap.from(el, {
        y: 50,
        scrollTrigger: {
          trigger: el,
          start: "top 80%",

        },
        duration: 1,
        ease: "circ.out",
      });
    });
  }, []);

  return (
    <section
      id="expertise"
      className="min-h-dvh rounded-4xl font-Quicksand"
    >
      <AnimatedHeaderSection
        subTitle="Skills / Certificates"
        title="Expertise"
        text={text}
        textColor="text-white"
        withScrollTrigger={true}
      />

      {expertiseData.map((expertise, index) => {
        return (
          <div
            ref={(el) => {
              expertiseRef.current[index] = el;
            }}
            key={`expertise-${index}`}
            className="sticky px-10 pt-6 pb-12 text-black bg-white border-t-2 border-black/30 rounded-4xl"
            style={isDesktop
              ? {
                top: `calc(0vh + ${index * 5}rem)`,
                marginBottom: `${(expertiseData.length - index - 1) * 5}rem`,
              }
              : {
                top: 0,
              }}
          >
            <div className="flex items-center justify-between gap-4 font-light">
              <div className="flex flex-col gap-6 w-full">
                <h2 className="text-4xl lg:text-5xl">
                  {expertise.title}
                </h2>
                <p className="text-xl leading-relaxed tracking-widest lg:text-2xl text-black text-pretty">
                  {expertise.description}
                </p>
                <div className="flex flex-col gap-2 text-2xl sm:gap-4 lg:text-3xl text-black">
                  {expertise.items.map((item, itemIndex) => {
                    const content = (
                      <div>
                        <h3 className="flex">
                          <span className="mr-12 text-lg text-black/90">
                            0{itemIndex + 1}
                          </span>
                          {item.title}
                        </h3>
                        <div className="w-full h-px my-2 bg-black/30" />
                      </div>
                    );

                    return "link" in item ? (
                      <a
                        key={`item-${itemIndex}`}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {content}
                      </a>
                    ) : (
                      <div key={`item-${itemIndex}`}>{content}</div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default Expertise;
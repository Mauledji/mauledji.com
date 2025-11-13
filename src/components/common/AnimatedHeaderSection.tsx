import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { FiExternalLink } from "react-icons/fi";
import { socials } from "../../constants/index.js";
import { AnimatedTextLines } from "./AnimatedTextLines";

interface AnimatedHeaderSectionProps {
    subTitle?: string
    title?: string
    text?: string
    textColor?: string
    withScrollTrigger?: boolean
    withSocials?: boolean
}

const AnimatedHeaderSection: React.FC<AnimatedHeaderSectionProps> = ({
    subTitle = "",
    title = "",
    text = "",
    textColor = "",
    withScrollTrigger = false,
    withSocials = false
}) => {
    const contextRef = useRef(null);
    const headerRef = useRef(null);
    const socialsRef = useRef(null);
    const shouldSplitTitle = title.includes(" ");
    const titleParts = shouldSplitTitle ? title.split(" ") : [title];

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: withScrollTrigger
                ? {
                    trigger: contextRef.current,
                }
                : undefined,
        });
        tl.from(contextRef.current, {
            y: "10vh",
            duration: 2,
            ease: "circ.out",
        });
        tl.from(
            headerRef.current,
            {
                opacity: 0,
                y: "200",
                duration: 2,
                ease: "circ.out",
            },
            "<+0.2"
        );
        tl.from(socialsRef.current, {
            y: 200,
            opacity: 0,
            duration: 2,
            ease: "circ.out",
        }, "<");
    }, []);
    return (
        <div ref={contextRef}>
            <div style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}>
                <div
                    ref={headerRef}
                    className="flex flex-col justify-center gap-5 pt-5 sm:gap-8"
                >
                    <p
                        className={`text-base font-normal tracking-[0.5rem] uppercase px-7  ${textColor}`}
                    >
                        {subTitle}
                    </p>
                    <div className="px-7">
                        <h1
                            className={`flex flex-col gap-8 uppercase banner-text-responsive sm:gap-12 custom:block pb-4 ${textColor}`}
                        >
                            {titleParts.map((part, index) => (
                                <span key={index}>{part} </span>
                            ))}
                        </h1>
                    </div>
                </div>
            </div>
            <div className={`relative px-7 ${textColor}`}>
                <div className="absolute inset-x-0 border-t-2" />
                {withSocials && (
                    <div ref={socialsRef} className="flex flex-wrap justify-start pt-5 gap-x-3 sm:gap-x-15 md:gap-x-25 lg:gap-x-50">
                        {socials.map((social, index) => (
                            <a
                                key={index}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm uppercase flex items-center gap-2"
                            >
                                <social.icon size={35} />
                                {social.name}
                            </a>
                        ))}
                        <a
                            href="/public/assets/CV_MAURICIO_LEDEZMA_JIMENEZ.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm uppercase flex items-center gap-2"
                        >
                            <FiExternalLink size={35} />
                            CV
                        </a>
                    </div>
                )}
                <div className="py-8 sm:py-12 text-end">
                    <AnimatedTextLines
                        text={text}
                        className={`font-light uppercase value-text-responsive ${textColor}`}
                    />
                </div>

            </div>
        </div>
    );
};

export default AnimatedHeaderSection;

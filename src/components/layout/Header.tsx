import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef, useState } from "react";
import { Link } from "react-scroll";
import { socials } from "../../constants/index.js";

gsap.registerPlugin(useGSAP, SplitText);

// Tipos para las referencias de elementos del DOM
interface LinkElement extends HTMLDivElement {
    _animationHandlers?: {
        mouseenter: () => void;
        mouseleave: () => void;
    };
}


const Header: React.FC = () => {
    const navRef = useRef<HTMLElement>(null);
    const linksRef = useRef<(LinkElement | null)[]>([]);
    const contactRef = useRef<HTMLDivElement>(null);
    const topLineRef = useRef<HTMLSpanElement>(null);
    const bottomLineRef = useRef<HTMLSpanElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);
    const iconTl = useRef<gsap.core.Timeline | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const splitInstances = useRef<SplitText[]>([]);

    const slideEase: string = "cubic-bezier(0.65,0.05,0.36,1)";

    useGSAP(() => {
        if (!navRef.current) return;

        gsap.set(navRef.current, { yPercent: -100 });
        gsap.set([linksRef.current, contactRef.current], {
            autoAlpha: 0,
            y: -20,
        });

        tl.current = gsap
            .timeline({ paused: true })
            .to(navRef.current, {
                yPercent: 0,
                duration: 1,
                ease: "power3.out",
            })
            .to(linksRef.current, {
                autoAlpha: 1,
                y: 0,
                stagger: 0.1,
                duration: 0.5,
                ease: "power2.out",
            }, "<+0.3")
            .to(contactRef.current, {
                autoAlpha: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
            }, "<+0.2");

        iconTl.current = gsap
            .timeline({ paused: true })
            .to(topLineRef.current, {
                rotate: 45,
                y: 3.3,
                duration: 0.3,
                ease: "power2.inOut",
            })
            .to(bottomLineRef.current, {
                rotate: -45,
                y: -3.3,
                duration: 0.3,
                ease: "power2.inOut",
            }, "<");

        // Configurar animaciones de los enlaces
        const setupLinkAnimations = (): void => {
            linksRef.current.forEach((linkElement) => {
                if (!linkElement) return;

                // Crear SplitText en el elemento DOM
                const splitLink = new SplitText(linkElement, {
                    type: "chars",
                    charsClass: "char",
                });

                // Guardar la instancia para poder limpiarla después
                splitInstances.current.push(splitLink);

                const totalChars: number = splitLink.chars.length;
                const middle: number = (totalChars - 1) / 2;

                // Evento mouseenter
                const handleMouseEnter = (): void => {
                    gsap.to(splitLink.chars, {
                        x: (i: number) => {
                            const distanceFromCenter = i - middle;
                            return `${distanceFromCenter * 0.1}em`;
                        },
                        duration: 0.2,
                        ease: slideEase,
                        stagger: {
                            each: 0.015,
                            from: "center"
                        }
                    });
                };

                // Evento mouseleave
                const handleMouseLeave = (): void => {
                    gsap.to(splitLink.chars, {
                        x: 0,
                        duration: 0.35,
                        ease: slideEase,
                        stagger: {
                            each: 0.01,
                            from: "end"
                        }
                    });
                };

                linkElement.addEventListener("mouseenter", handleMouseEnter);
                linkElement.addEventListener("mouseleave", handleMouseLeave);

                linkElement._animationHandlers = {
                    mouseenter: handleMouseEnter,
                    mouseleave: handleMouseLeave,
                };
            });
        };

        setupLinkAnimations();

        return () => {
            // Limpiar SplitText instances
            splitInstances.current.forEach((split) => {
                if (split && split.revert) {
                    split.revert();
                }
            });
            splitInstances.current = [];

            // Limpiar event listeners
            linksRef.current.forEach((linkElement) => {
                if (!linkElement || !linkElement._animationHandlers) return;

                const handlers = linkElement._animationHandlers;
                linkElement.removeEventListener("mouseenter", handlers.mouseenter);
                linkElement.removeEventListener("mouseleave", handlers.mouseleave);
                delete linkElement._animationHandlers;
            });

            document.body.style.overflow = "";
        };
    }, []);

    const toggleMenu = (): void => {
        if (!tl.current || !iconTl.current) return;

        if (isOpen) {
            tl.current.reverse();
            iconTl.current.reverse();
            document.body.style.overflow = "";
        } else {
            tl.current.play();
            iconTl.current.play();
            document.body.style.overflow = "hidden";
        }
        setIsOpen(!isOpen);
    };


    return (
        <>
            {/* Menú fullscreen */}
            <nav
                ref={navRef}
                className="fixed z-50 flex flex-col justify-between items-center w-full h-full px-10 bg-purple-80/50 text-white/80 backdrop-blur-lg py-28 gap-y-10 uppercase font-Quicksand"
            >
                <div className="flex flex-col items-center gap-y-2 text-4xl sm:text-5xl md:text-6xl lg:text-8xl">
                    {["home", "experience", "work", "expertise", "contact"].map((section, index) => (
                        <Link
                            key={index}
                            activeClass="active"
                            className="transition-all duration-300 cursor-pointer hover:text-white block"
                            to={section}
                            smooth
                            offset={0}
                            duration={2000}
                            onClick={toggleMenu}
                        >
                            <span
                                ref={(el) => {
                                    linksRef.current[index] = el as LinkElement | null;
                                }}
                                className="inline-block"
                            >
                                {section}
                            </span>
                        </Link>
                    ))}
                </div>

                <div
                    ref={contactRef}
                    className="flex flex-col flex-wrap justify-center items-center gap-5 md:gap-30 md:flex-row w-full"
                >
                    <div className="font-light text-center md:text-left w-full md:w-auto">
                        <p className="tracking-wider text-white/50">E-mail</p>
                        <p className="text-xl tracking-widest lowercase text-pretty">
                            mauledji@outlook.com
                        </p>
                    </div>
                    <div className="font-light text-center md:text-left w-full md:w-auto">
                        <p className="tracking-wider text-white/50">Social Media</p>
                        <div className="flex flex-col flex-wrap md:flex-row gap-x-2">
                            {socials.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm leading-loose tracking-widest uppercase hover:text-white transition-colors duration-300"
                                >
                                    {social.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Botón hamburguesa */}
            <div
                onClick={toggleMenu}
                className={`fixed z-50 flex flex-col items-center justify-center gap-1 p-4 backdrop-blur-xs rounded-full w-14 h-14 md:w-20 md:h-20 top-7 right-7 ${!isOpen ? "mix-blend-difference" : ""}`}
            >
                <span
                    ref={topLineRef}
                    className="block w-8 h-0.5 bg-white transition-all origin-center"
                />
                <span
                    ref={bottomLineRef}
                    className="block w-8 h-0.5 bg-white transition-all origin-center"
                />
            </div>
        </>
    );
};

export default Header;
import type { IconType } from "react-icons";
import { SiGithub, SiLinkedin } from "react-icons/si";

export interface Social {
    name: string,
    href: string;
    icon: IconType;
}

export const socials: Social[] = [
    { name: "GitHub", href: "https://github.com/MauricioLJ", icon: SiGithub },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/mauledji/", icon: SiLinkedin },
];

export const expertiseData = [
    {
        title: "Backend Development",
        description:
            "I build robust, scalable, and secure server-side systems that power applications with clean architecture, high performance, and maintainable code.",
        items: [
            {
                title: "Java",
            },
            {
                title: "Python",
            },
            {
                title: "C++",
            },
            {
                title: "SQL",
            },
            {
                title: "Spring Boot",
            },

        ],
    },
    {
        title: "Frontend Development",
        description:
            "I craft seamless, responsive, and visually engaging user interfaces with attention to accessibility, speed, and modern design principles.",
        items: [
            {
                title: "HTML",
            },
            {
                title: "CSS",
            },
            {
                title: "JavaScript",
            },
            {
                title: "Tailwind CSS",
            },
            {
                title: "Bootstrap",
            },
        ],
    },
    {
        title: "Frameworks / Libraries",
        description:
            "I use powerful frameworks and animation libraries to build interactive, dynamic, and high-performance web experiences that captivate users.",
        items: [
            {
                title: "React",
            },
            {
                title: "Astro",
            },
            {
                title: "GSAP",
            },
            {
                title: "Three.js",
            },
            {
                title: "Next.js",
            },
        ],
    },
    {
        title: "Tools & Other",
        description:
            "From version control to collaboration and data handling, I leverage the right tools and workflows to keep development efficient and organized.",
        items: [
            {
                title: "Git / GitHub",
            },
            {
                title: "Figma",
            },
            {
                title: "Scrum",
            },
            {
                title: "Bash Linux",
            },
            {
                title: "Pandas & Numpy",
            },


        ],
    },
    {
        title: "Certificates",
        description:
            "Verified certifications showcasing my proficiency in software development, artificial intelligence & other. Click any certificate to verify authenticity.",
        items: [
            {
                title: "Introduction to Software Engineering — IBM",
                link: "https://coursera.org/verify/TPED0VX10MIH",
            },
            {
                title: "Introduction to Artificial Intelligence (AI) — IBM",
                link: "https://coursera.org/verify/CN8RVK05IT8H",
            },
            {
                title: "Generative AI: Prompt Engineering Basics — IBM",
                link: "https://coursera.org/verify/NIQK5QMXBKKR",
            },
            {
                title: "Python for Data Science, AI & Development — IBM",
                link: "https://coursera.org/verify/QWUT1YYB0XMW",
            },
            {
                title: "Linux Essentials — LPI",
                link: "https://lpi.org/v/LPI000657842/rdvslxquwd",
            },
        ],
    },

];
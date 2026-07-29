function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button?.querySelector("i");

    if (!input || !icon) return;

    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const body = document.body;
    const themeStorageKey = "little-loom-theme";
    const rtlStorageKey = "little-loom-rtl";
    const darkModeClass = "ll-dark-mode";
    const rtlModeClass = "ll-rtl-mode";

    const theme = {
        dark: window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches,
        rtl: false
    };

    const readStoredState = (key) => {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    };

    const writeStoredState = (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            // Storage can be unavailable in some private browsing modes.
        }
    };


    const setThemeIcon = (button, isDark) => {
        const icon = button?.querySelector("i");
        if (!icon) return;

        icon.classList.toggle("fa-moon", !isDark);
        icon.classList.toggle("fa-sun", isDark);
        icon.classList.toggle("fa-regular", !isDark);
        icon.classList.toggle("fa-solid", isDark);
    };

    const updateModeControls = () => {
        const themeButtons = document.querySelectorAll(".dark-mode-toggle, .theme-toggle");
        const rtlButtons = document.querySelectorAll(".rtl-toggle");

        themeButtons.forEach((button) => {
            button.classList.toggle("active", theme.dark);
            button.setAttribute("aria-pressed", String(theme.dark));
            setThemeIcon(button, theme.dark);
        });

        rtlButtons.forEach((button) => {
            button.classList.toggle("active", theme.rtl);
            button.setAttribute("aria-pressed", String(theme.rtl));
        });
    };

    const applyTheme = (isDark) => {
        theme.dark = isDark;
        root.classList.toggle(darkModeClass, isDark);
        writeStoredState(themeStorageKey, isDark ? "dark" : "light");
        updateModeControls();
    };

    const applyRtl = (isRtl) => {
        theme.rtl = isRtl;
        root.classList.toggle(rtlModeClass, isRtl);
        root.setAttribute("dir", isRtl ? "rtl" : "ltr");
        body.classList.toggle(rtlModeClass, isRtl);
        writeStoredState(rtlStorageKey, isRtl ? "rtl" : "ltr");
        updateModeControls();
    };

    const injectThemeButton = (container) => {
        if (!container || container.querySelector(".dark-mode-toggle, .theme-toggle")) return;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "dark-mode-toggle theme-toggle";
        button.setAttribute("aria-label", "Toggle dark mode");
        button.innerHTML = '<i class="fa-regular fa-moon"></i>';

        const rtlButton = container.querySelector(".rtl-toggle");
        if (rtlButton) {
            container.insertBefore(button, rtlButton);
        } else {
            container.appendChild(button);
        }
    };

    const setupModeButtons = () => {
        const containerCandidates = [
            document.querySelector(".auth-controls"),
            document.querySelector(".header-actions"),
            document.querySelector(".nav-right")
        ].filter(Boolean);

        containerCandidates.forEach(injectThemeButton);

        const looseThemeButton = document.querySelector(".dark-mode-toggle, .theme-toggle");
        if (looseThemeButton) {
            looseThemeButton.setAttribute("aria-label", "Toggle dark mode");
            looseThemeButton.setAttribute("type", looseThemeButton.getAttribute("type") || "button");
        }

        const looseRtlButtons = document.querySelectorAll(".rtl-toggle");
        looseRtlButtons.forEach((button) => {
            button.setAttribute("aria-label", "Toggle RTL mode");
            button.setAttribute("type", button.getAttribute("type") || "button");
        });
    };

    const storedTheme = readStoredState(themeStorageKey);
    const storedRtl = readStoredState(rtlStorageKey);

    setupModeButtons();

    if (storedTheme === "dark") {
        theme.dark = true;
    } else if (storedTheme === "light") {
        theme.dark = false;
    }

    if (storedRtl === "rtl") {
        theme.rtl = true;
    } else if (storedRtl === "ltr") {
        theme.rtl = false;
    }

    applyTheme(theme.dark);
    applyRtl(theme.rtl);

    document.querySelectorAll(".dark-mode-toggle, .theme-toggle").forEach((button) => {
        button.addEventListener("click", () => {
            applyTheme(!theme.dark);
        });
    });

    document.querySelectorAll(".rtl-toggle").forEach((button) => {
        button.addEventListener("click", () => {
            applyRtl(!theme.rtl);
        });
    });

    /*=====================================
            Scroll To Top
    =====================================*/
    const scrollTopBtn = document.querySelector(".scroll-top-btn");

    if (scrollTopBtn) {
        const updateScrollButton = () => {
            scrollTopBtn.classList.toggle("show", window.scrollY > 300);
        };

        window.addEventListener("scroll", updateScrollButton, { passive: true });
        updateScrollButton();

        scrollTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    /*=====================================
        Active Navigation
    =====================================*/
    const navLinks = document.querySelectorAll(".nav-menu a");
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    navLinks.forEach((link) => {
        const href = link.getAttribute("href");

        if (!href || href === "#" || href.startsWith("javascript:")) return;

        if (href === currentPage) {
            link.classList.add("active");

            const dropdown = link.closest(".dropdown");

            if (dropdown) {
                dropdown.classList.add("current");

                const trigger = dropdown.querySelector(":scope > a, :scope > button");

                if (trigger) {
                    trigger.setAttribute("aria-expanded", "false");
                }
            }
        }
    });

    /*=====================================
        Mobile Navigation
    ======================================*/
    const navToggle = document.querySelector(".nav-toggle");
    const navClose = document.querySelector(".nav-close");
    const navPanel = document.querySelector(".nav-panel");
    const navOverlay = document.querySelector(".nav-overlay");

    if (navToggle && navPanel && navOverlay) {
        const openMenu = () => {
            navPanel.classList.add("active");
            navOverlay.classList.add("active");
            document.body.classList.add("menu-open");
            navToggle.setAttribute("aria-expanded", "true");
        };

        const closeMenu = () => {
            navPanel.classList.remove("active");
            navOverlay.classList.remove("active");
            document.body.classList.remove("menu-open");
            navToggle.setAttribute("aria-expanded", "false");
        };

        navToggle.addEventListener("click", openMenu);

        if (navClose) {
            navClose.addEventListener("click", closeMenu);
        }

        navOverlay.addEventListener("click", closeMenu);

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeMenu();
            }
        });
    }

    /*=====================================
        Mobile Dropdown
    ======================================*/
    const dropdownButtons = document.querySelectorAll(".dropdown > .dropdown-toggle");

    dropdownButtons.forEach((button) => {
        button.addEventListener("click", function (e) {
            if (window.innerWidth > 1024) return;

            e.preventDefault();

            const parent = this.parentElement;

            document.querySelectorAll(".dropdown").forEach((item) => {
                if (item !== parent) {
                    item.classList.remove("active");
                }
            });

            parent.classList.toggle("active");
        });
    });
});

document.documentElement.classList.add("ll-reveal-js");

document.addEventListener("DOMContentLoaded", () => {
    const llReduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const llObserved = new WeakSet();
    const llCounted = new WeakSet();

    const llRevealObserver = llReduceMotion
        ? null
        : new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                observer.unobserve(entry.target);
                entry.target.classList.add("ll-reveal-visible");
            });
        }, {
            threshold: 0.22,
            rootMargin: "0px 0px -8% 0px"
        });

    const llCounterObserver = llReduceMotion
        ? null
        : new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                observer.unobserve(entry.target);

                if (llCounted.has(entry.target)) return;

                llCounted.add(entry.target);
                llAnimateCounter(entry.target);
            });
        }, {
            threshold: 0.45,
            rootMargin: "0px 0px -6% 0px"
        });

    const llRegisterReveal = (element, variant = "up", delay = 0) => {
        if (!element || llObserved.has(element)) return;

        llObserved.add(element);
        element.classList.add("ll-reveal", `ll-reveal-${variant}`);

        if (delay > 0) {
            element.style.setProperty("--ll-reveal-delay", `${delay}ms`);
        }

        if (llReduceMotion) {
            element.classList.add("ll-reveal-visible");
            return;
        }

        llRevealObserver?.observe(element);
    };

    const llIsExcluded = (element) => {
        const className = String(element.className || "").toLowerCase();

        return /(?:nav|menu|overlay|dropdown|toggle|button|btn|form|input|textarea|select|label|field|scroll-top|logo)/.test(className);
    };

    const llHasKeyword = (element, pattern) => pattern.test(String(element.className || "").toLowerCase());

    const llVariantForElement = (element) => {
        const className = String(element.className || "").toLowerCase();

        if (/(image|gallery|visual|photo|preview|hero-two-image|about-story-image|about-makers-image|cta-image|seasonfeature-main-image|sizemeasure-image)/.test(className)) {
            return "scale";
        }

        if (/(card|item|feature|box|stat|counter|testimonial|product|category|collection|benefit|team|value|timeline|pricing)/.test(className)) {
            return "scale";
        }

        if (/(header|title|subtitle|description|text|content|info|wrapper|badge|caption)/.test(className)) {
            return "up";
        }

        return "up";
    };

    const llStaggerChildren = (container, mode = "up") => {
        if (!container || llIsExcluded(container)) return;

        const children = Array.from(container.children).filter((child) => child.nodeType === Node.ELEMENT_NODE);
        if (!children.length) return;

        const containerClass = String(container.className || "").toLowerCase();
        const isSplitLayout =
            children.length === 2 &&
            /(wrapper|section|content|grid|hero|cta|trust|story|makers|measure|order|contact|seasonfeature|schooluniform)/.test(containerClass);

        children.forEach((child, index) => {
            if (llIsExcluded(child)) return;

            let variant = mode;

            if (isSplitLayout) {
                variant = index === 0 ? "left" : "right";
            } else if (llVariantForElement(child) === "scale" || /(card|item|feature|box|stat|counter)/.test(String(child.className || "").toLowerCase())) {
                variant = "scale";
            }

            llRegisterReveal(child, variant, Math.min(index * 120, 900));
        });
    };

    const llRevealBlocks = [
        "section .container > *",
        "footer .container > *",
        "footer .footer-bottom > *",
        ".page-banner-content",
        ".hero-content",
        ".hero-two-content",
        ".hero-two-image",
        ".section-title",
        ".about-story-image",
        ".about-story-content",
        ".about-journey-heading",
        ".about-makers-content",
        ".about-makers-image",
        ".about-highlights-header",
        ".about-trust-header",
        ".about-final-cta-content",
        ".about-final-cta-image",
        ".kidswear-category-header",
        ".babywear-showcase-header",
        ".giftset-showcase-header",
        ".giftset-showcase-content",
        ".kids-fashion-content",
        ".kids-fashion-large-image",
        ".kids-fashion-small-images",
        ".schooluniform-collection-content",
        ".schooluniform-collection-gallery",
        ".schoolcategory-showcase-header",
        ".uniformexcellence-header",
        ".uniformexcellence-features",
        ".schooluniformcta-content",
        ".seasoncollection-header",
        ".seasonfeature-content",
        ".seasonfeature-images",
        ".seasonbenefit-header",
        ".seasoncta-content",
        ".sizemeasure-content",
        ".sizechart-header",
        ".sizecare-header",
        ".sizeguidecta-content",
        ".contact-content",
        ".contact-cta",
        ".contact-info",
        ".contact-form-wrapper",
        ".contact-map",
        ".custom-order-card",
        ".auth-card",
        ".custom-parallax-content",
        ".season-content",
        ".littleloom-trust-content",
        ".promise",
        ".occasion",
        ".best-product-content",
        ".footer-column",
        ".footer-logo",
        ".footer-bottom"
    ];

    llRevealBlocks.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
            if (llIsExcluded(element)) return;
            if (element.matches(".hero-two-wrapper, .about-story-wrapper, .about-makers-wrapper, .schooluniform-collection-wrapper, .seasonfeature-wrapper, .sizemeasure-wrapper, .contact-wrapper, .custom-parallax, .littleloom-trust-wrapper, .season-wrapper, .cta-wrapper, .about-final-cta-wrapper, .kids-fashion-wrapper")) {
                return;
            }
            if (element.closest(".category-wrapper, .why-wrapper, .featured-wrapper, .shop-age-wrapper, .best-sellers-grid, .testimonial-wrapper, .hero-stats, .about-story-counter-area, .about-journey-timeline, .about-values-grid, .about-highlights-wrapper, .about-trust-wrapper, .about-makers-list, .kidswear-category-grid, .babywear-showcase-grid, .giftset-showcase-grid, .kids-fashion-features, .kids-fashion-gallery, .schooluniform-collection-features, .schooluniform-collection-gallery, .schoolcategory-showcase-grid, .uniformexcellence-wrapper, .uniformexcellence-features, .seasoncollection-grid, .seasonfeature-list, .seasonbenefit-grid, .sizechart-grid, .sizecare-grid, .contact-info-wrapper, .contact-form-grid, .custom-order-form-grid, .auth-form-grid, .cta-buttons, .kidswear-final-cta-buttons, .schooluniformcta-buttons, .seasoncta-buttons, .sizeguidecta-buttons, .about-final-cta-actions, .footer-wrapper, .footer-links, .footer-social, .footer-contact")) {
                return;
            }

            llRegisterReveal(element, llVariantForElement(element));
        });
    });

    const llStaggerGroups = [
        ".category-wrapper",
        ".why-wrapper",
        ".featured-wrapper",
        ".shop-age-wrapper",
        ".best-sellers-grid",
        ".testimonial-wrapper",
        ".hero-stats",
        ".about-story-counter-area",
        ".about-journey-timeline",
        ".about-values-grid",
        ".about-highlights-wrapper",
        ".about-trust-wrapper",
        ".about-makers-list",
        ".hero-two-wrapper",
        ".about-story-wrapper",
        ".about-makers-wrapper",
        ".schooluniform-collection-wrapper",
        ".seasonfeature-wrapper",
        ".sizemeasure-wrapper",
        ".contact-wrapper",
        ".custom-parallax",
        ".littleloom-trust-wrapper",
        ".season-wrapper",
        ".cta-wrapper",
        ".about-final-cta-wrapper",
        ".kids-fashion-wrapper",
        ".kidswear-category-grid",
        ".babywear-showcase-grid",
        ".giftset-showcase-grid",
        ".kids-fashion-features",
        ".kids-fashion-gallery",
        ".schooluniform-collection-features",
        ".schooluniform-collection-gallery",
        ".schoolcategory-showcase-grid",
        ".uniformexcellence-wrapper",
        ".uniformexcellence-features",
        ".seasoncollection-grid",
        ".seasonfeature-list",
        ".seasonbenefit-grid",
        ".sizechart-grid",
        ".sizecare-grid",
        ".contact-info-wrapper",
        ".contact-form-grid",
        ".custom-order-form-grid",
        ".auth-form-grid",
        ".cta-buttons",
        ".kidswear-final-cta-buttons",
        ".schooluniformcta-buttons",
        ".seasoncta-buttons",
        ".sizeguidecta-buttons",
        ".about-final-cta-actions",
        ".footer-wrapper",
        ".footer-links",
        ".footer-social",
        ".footer-contact"
    ];

    llStaggerGroups.forEach((selector) => {
        document.querySelectorAll(selector).forEach((container) => {
            if (llIsExcluded(container)) return;
            llStaggerChildren(container);
        });
    });

    const llCounterSelectors = [
        ".hero-rating strong",
        ".hero-stats h3",
        ".hero-stat h3",
        ".about-story-counter-box h3",
        ".about-highlights-card h3",
        ".uniformexcellence-stat-card h3"
    ];

    const llCounterMeta = (text) => {
        const trimmed = String(text || "").replace(/\s+/g, " ").trim();
        const match = trimmed.match(/^([0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/);

        if (!match) return null;

        const finalValue = Number.parseFloat(match[1].replace(/,/g, ""));
        if (!Number.isFinite(finalValue)) return null;

        const decimals = (match[1].split(".")[1] || "").length;

        return {
            finalText: trimmed,
            value: finalValue,
            decimals,
            suffix: match[2] || "",
            useComma: match[1].includes(",")
        };
    };

    const llFormatCounterValue = (value, meta) => {
        if (meta.decimals > 0) {
            return `${value.toFixed(meta.decimals)}${meta.suffix}`;
        }

        const rounded = Math.round(value);
        const numberText = meta.useComma ? rounded.toLocaleString() : String(rounded);
        return `${numberText}${meta.suffix}`;
    };

    const llAnimateCounter = (element) => {
        const meta = llCounterMeta(element.textContent);
        if (!meta) return;

        const duration = 900;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = meta.value * eased;

            element.textContent = progress >= 1 ? meta.finalText : llFormatCounterValue(current, meta);

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        };

        element.textContent = llFormatCounterValue(0, meta);
        requestAnimationFrame(tick);
    };

    llCounterSelectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
            if (llIsExcluded(element)) return;
            if (llCounterMeta(element.textContent)) {
                llCounterObserver?.observe(element);
            }
        });
    });
});

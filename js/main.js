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
    const scrollStorageKey = `little-loom-scroll-y:${window.location.pathname}`;
    const darkModeClass = "ll-dark-mode";
    const rtlModeClass = "ll-rtl-mode";

    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }

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

    const readSessionState = (key) => {
        try {
            return sessionStorage.getItem(key);
        } catch (error) {
            return null;
        }
    };

    const writeSessionState = (key, value) => {
        try {
            sessionStorage.setItem(key, value);
        } catch (error) {
            // Session storage can also be blocked in private browsing modes.
        }
    };

    const getScrollElement = () => {
        const docEl = document.scrollingElement || document.documentElement;
        const body = document.body;

        if (docEl && docEl.scrollHeight > docEl.clientHeight + 1) {
            return docEl;
        }

        if (body && body.scrollHeight > window.innerHeight + 1) {
            return body;
        }

        return docEl;
    };

    const getScrollTop = (el) => {
        if (!el) return 0;
        return el === window ? (window.scrollY || window.pageYOffset || 0) : (el.scrollTop || 0);
    };

    const setScrollTop = (el, scrollY, behavior = "auto") => {
        if (!el) return;

        if (el === window) {
            window.scrollTo({ top: scrollY, behavior });
            return;
        }

        if (typeof el.scrollTo === "function") {
            el.scrollTo({ top: scrollY, behavior });
            return;
        }

        el.scrollTop = scrollY;
    };

    const saveScrollPosition = () => {
        const scrollElement = getScrollElement();

        writeSessionState(
            scrollStorageKey,
            String(getScrollTop(scrollElement))
        );
    };

    const restoreScrollPosition = () => {
        const storedScrollY = readSessionState(scrollStorageKey);
        if (storedScrollY === null) return;

        const scrollY = Number(storedScrollY);
        if (Number.isNaN(scrollY)) return;

        let attempts = 0;
        const maxAttempts = 6;

        const tryRestore = () => {
            attempts += 1;
            const el = getScrollElement();
            setScrollTop(el, scrollY);

            // Check if scroll was actually applied; if not, retry
            if (getScrollTop(el) < 1 && scrollY > 0 && attempts < maxAttempts) {
                const delays = [0, 150, 400, 800, 1200, 2000];
                const delay = delays[attempts - 1] || 2000;
                setTimeout(tryRestore, delay);
            }
        };

        tryRestore();
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
            const icon = button.querySelector("i");
            if (icon) {
                icon.className = "fa-solid fa-right-left";
            } else {
                button.innerHTML = '<i class="fa-solid fa-right-left"></i>';
            }
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
    restoreScrollPosition();
    const scrollElement = getScrollElement();
    const scrollEventTarget = scrollElement === body ? body : window;

    window.addEventListener("load", restoreScrollPosition);
    window.addEventListener("pageshow", restoreScrollPosition);
    window.addEventListener("pagehide", saveScrollPosition);
    window.addEventListener("beforeunload", saveScrollPosition);
    scrollEventTarget.addEventListener("scroll", saveScrollPosition, { passive: true });
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            saveScrollPosition();
        }
    });

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
            scrollTopBtn.classList.toggle("show", getScrollTop(getScrollElement()) > 300);
        };

        scrollEventTarget.addEventListener("scroll", updateScrollButton, { passive: true });
        updateScrollButton();

        scrollTopBtn.addEventListener("click", () => {
            setScrollTop(getScrollElement(), 0, "smooth");
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
            threshold: 0.12,
            rootMargin: "0px 0px 12% 0px"
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

    const llStaggerChildren = (container, mode = "up", delayStep = 120) => {
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

            llRegisterReveal(child, variant, Math.min(index * delayStep, 900));
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
        ".shopcatalog-filter-card",
        ".shopcatalog-toolbar",
        ".season-content",
        ".littleloom-trust-content",
        ".promise",
        ".occasion",
        ".best-product-content"
    ];

    llRevealBlocks.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
            if (llIsExcluded(element)) return;
            if (element.matches(".hero-two-wrapper, .about-story-wrapper, .about-makers-wrapper, .schooluniform-collection-wrapper, .seasonfeature-wrapper, .sizemeasure-wrapper, .contact-wrapper, .custom-parallax, .littleloom-trust-wrapper, .season-wrapper, .cta-wrapper, .about-final-cta-wrapper, .kids-fashion-wrapper")) {
                return;
            }
            if (element.closest(".category-wrapper, .why-wrapper, .featured-wrapper, .shop-age-wrapper, .best-sellers-grid, .testimonial-wrapper, .hero-stats, .about-story-counter-area, .about-journey-timeline, .about-values-grid, .about-highlights-wrapper, .about-trust-wrapper, .about-makers-list, .kidswear-category-grid, .babywear-showcase-grid, .giftset-showcase-grid, .kids-fashion-features, .kids-fashion-gallery, .schooluniform-collection-features, .schooluniform-collection-gallery, .schoolcategory-showcase-grid, .uniformexcellence-wrapper, .uniformexcellence-features, .seasoncollection-grid, .seasonfeature-list, .seasonbenefit-grid, .sizechart-grid, .sizecare-grid, .contact-info-wrapper, .contact-form-grid, .custom-order-form-grid, .auth-form-grid, .cta-buttons, .kidswear-final-cta-buttons, .schooluniformcta-buttons, .seasoncta-buttons, .sizeguidecta-buttons, .about-final-cta-actions, .footer-wrapper, .footer-links, .footer-social, .footer-contact, .shopcatalog-wrapper")) {
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
        ".shopcatalog-grid",
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
        ".about-final-cta-actions"
    ];

    llStaggerGroups.forEach((selector) => {
        document.querySelectorAll(selector).forEach((container) => {
            if (llIsExcluded(container)) return;

            const isShopCatalogGrid = container.matches(".shopcatalog-grid");
            llStaggerChildren(container, "up", isShopCatalogGrid ? 70 : 120);
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

document.addEventListener("DOMContentLoaded", () => {
    /*=====================================
        Shop Catalog Interactions
    =====================================*/
    const llShopCatalogSection = document.querySelector(".shopcatalog");
    if (!llShopCatalogSection) return;

    const llShopCatalogGrid = document.querySelector(".shopcatalog-grid");
    const llShopCatalogSearchInput = document.querySelector(".ll-shop-search-input");
    const llShopCatalogSortSelect = document.querySelector(".shopcatalog-sort");
    const llShopCatalogResetButton = document.querySelector(".shopcatalog-reset-btn");
    const llShopCatalogCount = document.querySelector(".ll-shop-product-count");
    const llShopCatalogChipWrap = document.querySelector(".ll-shop-filter-chips");
    const llShopCatalogFilterInputs = Array.from(
        document.querySelectorAll('.shopcatalog-filter input[data-ll-shop-filter]')
    );

    if (!llShopCatalogGrid || !llShopCatalogSortSelect || !llShopCatalogCount || !llShopCatalogChipWrap) {
        return;
    }

    const llShopCatalogCards = Array.from(llShopCatalogGrid.querySelectorAll(".shopcatalog-card")).map((card, index) => {
        const llShopCatalogName = String(
            card.dataset.name || card.querySelector("h3")?.textContent || ""
        ).trim().toLowerCase();

        return {
            element: card,
            sourceIndex: index,
            name: llShopCatalogName,
            age: String(card.dataset.age || "").trim().toLowerCase(),
            gender: String(card.dataset.gender || "").trim().toLowerCase(),
            season: String(card.dataset.season || "").trim().toLowerCase(),
            size: String(card.dataset.size || "").trim().toLowerCase(),
            price: Number(card.dataset.price || 0),
            popular: String(card.dataset.popular || "").toLowerCase() === "true",
            newest: String(card.dataset.new || "").toLowerCase() === "true"
        };
    });

    const llShopCatalogState = {
        search: "",
        sort: llShopCatalogSortSelect.value || "default",
        filters: {
            age: new Set(),
            gender: new Set(),
            season: new Set(),
            size: new Set(),
            price: null
        }
    };

    const llShopCatalogLabelMap = {
        age: {
            "0-2": "0-2 Years",
            "3-5": "3-5 Years",
            "6-8": "6-8 Years",
            "9-12": "9-12 Years"
        },
        gender: {
            boys: "Boys",
            girls: "Girls",
            unisex: "Unisex"
        },
        season: {
            summer: "Summer",
            winter: "Winter",
            festive: "Festive"
        },
        size: {
            s: "S",
            m: "M",
            l: "L",
            xl: "XL"
        }
    };

    const llShopCatalogPriceLabelMap = {
        "0-499": "Below \u20B9500",
        "500-1000": "\u20B9500 - \u20B91000",
        "1001-1500": "\u20B91000 - \u20B91500",
        "1501-999999": "Above \u20B91500"
    };

    const llShopCatalogFilterOrder = ["age", "gender", "season", "size", "price"];

    const llShopCatalogReadState = () => {
        llShopCatalogState.search = String(llShopCatalogSearchInput?.value || "").trim().toLowerCase();
        llShopCatalogState.sort = llShopCatalogSortSelect.value || "default";

        Object.keys(llShopCatalogState.filters).forEach((group) => {
            if (llShopCatalogState.filters[group] instanceof Set) {
                llShopCatalogState.filters[group].clear();
            }
        });
        llShopCatalogState.filters.price = null;

        llShopCatalogFilterInputs.forEach((input) => {
            if (!input.checked) return;

            const group = String(input.dataset.llShopFilter || "").toLowerCase();
            const value = String(input.dataset.llShopValue || "").trim().toLowerCase();

            if (group === "price") {
                llShopCatalogState.filters.price = {
                    min: Number(input.dataset.llShopMin || 0),
                    max: Number(input.dataset.llShopMax || 0)
                };
                return;
            }

            if (llShopCatalogState.filters[group] instanceof Set && value) {
                llShopCatalogState.filters[group].add(value);
            }
        });
    };

    const llShopCatalogGetPriceChipLabel = (priceFilter) => {
        if (!priceFilter) return "";
        return llShopCatalogPriceLabelMap[`${priceFilter.min}-${priceFilter.max}`] || "";
    };

    const llShopCatalogMatchesCard = (card) => {
        if (llShopCatalogState.search && !card.name.includes(llShopCatalogState.search)) {
            return false;
        }

        if (llShopCatalogState.filters.age.size && !llShopCatalogState.filters.age.has(card.age)) {
            return false;
        }

        if (llShopCatalogState.filters.gender.size && !llShopCatalogState.filters.gender.has(card.gender)) {
            return false;
        }

        if (llShopCatalogState.filters.season.size && !llShopCatalogState.filters.season.has(card.season)) {
            return false;
        }

        if (llShopCatalogState.filters.size.size && !llShopCatalogState.filters.size.has(card.size)) {
            return false;
        }

        if (llShopCatalogState.filters.price) {
            const { min, max } = llShopCatalogState.filters.price;
            if (card.price < min || card.price > max) {
                return false;
            }
        }

        return true;
    };

    const llShopCatalogSortCards = (cards) => {
        const llShopCatalogSortedCards = cards.slice();

        llShopCatalogSortedCards.sort((a, b) => {
            switch (llShopCatalogState.sort) {
                case "newest":
                    return Number(b.newest) - Number(a.newest) || a.sourceIndex - b.sourceIndex;
                case "popular":
                    return Number(b.popular) - Number(a.popular) || a.sourceIndex - b.sourceIndex;
                case "price-asc":
                    return a.price - b.price || a.sourceIndex - b.sourceIndex;
                case "price-desc":
                    return b.price - a.price || a.sourceIndex - b.sourceIndex;
                default:
                    return a.sourceIndex - b.sourceIndex;
            }
        });

        return llShopCatalogSortedCards;
    };

    const llShopCatalogUpdateCounter = (count) => {
        llShopCatalogCount.textContent = String(count);
    };

    const llShopCatalogRenderChips = () => {
        const llShopCatalogChipNodes = [];

        llShopCatalogFilterOrder.forEach((group) => {
            if (group === "price") {
                const priceFilter = llShopCatalogState.filters.price;
                if (!priceFilter) return;

                const chip = document.createElement("span");
                chip.className = "ll-shop-filter-chip";
                chip.textContent = llShopCatalogGetPriceChipLabel(priceFilter);

                const removeButton = document.createElement("button");
                removeButton.type = "button";
                removeButton.setAttribute("aria-label", "Remove price filter");
                removeButton.innerHTML = "&times;";
                removeButton.addEventListener("click", () => {
                    llShopCatalogFilterInputs.forEach((input) => {
                        if (String(input.dataset.llShopFilter || "").toLowerCase() === "price") {
                            input.checked = false;
                        }
                    });
                    llShopCatalogRender();
                });

                chip.appendChild(removeButton);
                llShopCatalogChipNodes.push(chip);
                return;
            }

            const values = Array.from(llShopCatalogState.filters[group] || []);
            values.forEach((value) => {
                const chip = document.createElement("span");
                chip.className = "ll-shop-filter-chip";
                chip.textContent = `${group === "age" ? "Age : " : ""}${llShopCatalogLabelMap[group]?.[value] || value}`;

                const removeButton = document.createElement("button");
                removeButton.type = "button";
                removeButton.setAttribute("aria-label", `Remove ${llShopCatalogLabelMap[group]?.[value] || value} filter`);
                removeButton.innerHTML = "&times;";
                removeButton.addEventListener("click", () => {
                    llShopCatalogFilterInputs.forEach((input) => {
                        const inputGroup = String(input.dataset.llShopFilter || "").toLowerCase();
                        const inputValue = String(input.dataset.llShopValue || "").trim().toLowerCase();
                        if (inputGroup === group && inputValue === value) {
                            input.checked = false;
                        }
                    });
                    llShopCatalogRender();
                });

                chip.appendChild(removeButton);
                llShopCatalogChipNodes.push(chip);
            });
        });

        llShopCatalogChipWrap.replaceChildren(...llShopCatalogChipNodes);
        llShopCatalogChipWrap.hidden = llShopCatalogChipNodes.length === 0;
    };

    const llShopCatalogRender = () => {
        llShopCatalogReadState();

        const llShopCatalogSortedCards = llShopCatalogSortCards(llShopCatalogCards);
        let llShopCatalogVisibleCount = 0;

        llShopCatalogSortedCards.forEach((card) => {
            const isVisible = llShopCatalogMatchesCard(card);
            card.element.classList.toggle("ll-shop-hidden", !isVisible);
            if (isVisible) {
                llShopCatalogVisibleCount += 1;
            }
        });

        llShopCatalogGrid.replaceChildren(...llShopCatalogSortedCards.map((card) => card.element));
        llShopCatalogUpdateCounter(llShopCatalogVisibleCount);
        llShopCatalogRenderChips();
    };

    const llShopCatalogResetFilters = () => {
        llShopCatalogFilterInputs.forEach((input) => {
            input.checked = false;
        });

        if (llShopCatalogSearchInput) {
            llShopCatalogSearchInput.value = "";
        }

        llShopCatalogSortSelect.value = "default";
        llShopCatalogRender();
    };

    llShopCatalogSearchInput?.addEventListener("input", llShopCatalogRender);
    llShopCatalogSortSelect.addEventListener("change", llShopCatalogRender);

    llShopCatalogFilterInputs.forEach((input) => {
        input.addEventListener("change", llShopCatalogRender);
    });

    llShopCatalogResetButton?.addEventListener("click", llShopCatalogResetFilters);

    llShopCatalogRender();
});

document.addEventListener("DOMContentLoaded", () => {
    /*=====================================
        Shop Filter Panel
    =====================================*/
    const llShopFilterSection = document.querySelector(".shopcatalog");
    const llShopFilterWrapper = document.querySelector(".shopcatalog-wrapper");
    const llShopFilterSidebar = document.querySelector(".shopcatalog-filter");
    const llShopFilterProducts = document.querySelector(".shopcatalog-products");
    const llShopFilterToggle = document.querySelector(".ll-shop-filter-toggle");
    const llShopFilterPanel = document.querySelector(".ll-shop-filter-panel");
    const llShopFilterPanelInner = document.querySelector(".ll-shop-filter-panel-inner");
    const llShopFilterOverlay = document.querySelector(".ll-shop-filter-overlay");
    const llShopFilterCloseButton = document.querySelector(".ll-shop-filter-close");

    if (
        !llShopFilterSection ||
        !llShopFilterWrapper ||
        !llShopFilterSidebar ||
        !llShopFilterProducts ||
        !llShopFilterToggle ||
        !llShopFilterPanel ||
        !llShopFilterPanelInner ||
        !llShopFilterOverlay ||
        !llShopFilterCloseButton
    ) {
        return;
    }

    const llShopFilterMediaQuery = window.matchMedia("(max-width: 991px)");

    const llShopFilterMoveSidebarIntoPanel = () => {
        if (llShopFilterSidebar.parentElement !== llShopFilterPanelInner) {
            llShopFilterPanelInner.appendChild(llShopFilterSidebar);
        }
    };

    const llShopFilterRestoreSidebar = () => {
        if (llShopFilterSidebar.parentElement !== llShopFilterWrapper) {
            llShopFilterWrapper.insertBefore(llShopFilterSidebar, llShopFilterProducts);
        }
    };

    const llShopFilterClosePanel = () => {
        llShopFilterPanel.classList.remove("is-active");
        llShopFilterOverlay.classList.remove("is-active");
        llShopFilterOverlay.hidden = true;
        llShopFilterPanel.setAttribute("aria-hidden", "true");
        llShopFilterToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("ll-shop-filter-open");
    };

    const llShopFilterOpenPanel = () => {
        if (!llShopFilterMediaQuery.matches) return;

        llShopFilterMoveSidebarIntoPanel();
        llShopFilterOverlay.hidden = false;
        llShopFilterPanel.classList.add("is-active");
        llShopFilterPanel.setAttribute("aria-hidden", "false");
        llShopFilterToggle.setAttribute("aria-expanded", "true");
        document.body.classList.add("ll-shop-filter-open");

        requestAnimationFrame(() => {
            llShopFilterOverlay.classList.add("is-active");
        });
    };

    const llShopFilterSyncLayout = () => {
        if (llShopFilterMediaQuery.matches) {
            llShopFilterMoveSidebarIntoPanel();
        } else {
            llShopFilterClosePanel();
            llShopFilterRestoreSidebar();
        }
    };

    llShopFilterToggle.addEventListener("click", () => {
        if (llShopFilterPanel.classList.contains("is-active")) {
            llShopFilterClosePanel();
        } else {
            llShopFilterOpenPanel();
        }
    });

    llShopFilterCloseButton.addEventListener("click", llShopFilterClosePanel);
    llShopFilterOverlay.addEventListener("click", llShopFilterClosePanel);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && llShopFilterPanel.classList.contains("is-active")) {
            llShopFilterClosePanel();
        }
    });

    if (typeof llShopFilterMediaQuery.addEventListener === "function") {
        llShopFilterMediaQuery.addEventListener("change", llShopFilterSyncLayout);
    } else if (typeof llShopFilterMediaQuery.addListener === "function") {
        llShopFilterMediaQuery.addListener(llShopFilterSyncLayout);
    }

    llShopFilterSyncLayout();
});

/*=====================================
        Home 2 Testimonial Slider
======================================*/

const home2Testimonial = new Swiper(".home2-testimonial-slider", {

    effect: "fade",

    fadeEffect: {
        crossFade: true
    },

    loop: true,

    speed: 1000,

    spaceBetween: 30,

    grabCursor: true,

    centeredSlides: true,

    autoplay: {

        delay: 5000,

        disableOnInteraction: false,

        pauseOnMouseEnter: true,

    },

    pagination: {

        el: ".home2-pagination",

        clickable: true,

    },

    navigation: {

        nextEl: ".home2-next",

        prevEl: ".home2-prev",

    },

});

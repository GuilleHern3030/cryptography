function scrollSlowlyTo(anElement) {
    const scrolled = window.scrollY || window.pageYOffset;
    const posTop = anElement.getBoundingClientRect().y + scrolled;
    window.scrollTo({ top: posTop, behavior: "smooth" });
}
function actionDebug() {
    this.debug(true);
    this.compile("\\.html$");
};

function actionRelease() {
    this.debug(false);
    this.compile("\\.html$");
};

module.exports = {
    RELEASE: {
        caption: "Building project (RELEASE mode).",
        command: actionRelease
    },
    DEBUG: {
        caption: "Building project (DEBUG mode).",
        command: actionDebug
    }
};

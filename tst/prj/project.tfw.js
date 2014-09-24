function actionCompile() {
    this.compile("\\.html$");
    this.publish("tfw");
}

function actionDebug() {
    this.debug(true);
    actionCompile.call(this);
}

function actionRelease() {
    this.debug(false);
    actionCompile.call(this);
}

function actionDeployLocal() {
    this.deploy(
        "../../../../www/Cantine"
    );
}

module.exports = {
    RELEASE: {
        caption: "Building project (RELEASE mode).",
        command: actionRelease
    },
    DEBUG: {
        caption: "Building project (DEBUG mode).",
        command: actionDebug
    },
    DEPLOY: {
        caption: "Copy result on the local webserver.",
        command: actionDeployLocal
    }
};

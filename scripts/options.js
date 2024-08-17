function saveOptions() {
    const redirectLink = document.getElementById("redirect-link").value;
    const urlMatchPatterns = document.getElementById("url-match-patterns").value;

    chrome.storage.sync.set(
        { redirectLink: redirectLink, urlMatchPatterns: urlMatchPatterns.split("\n") },
        () => { showStatus("Options saved.") },
    );
    chrome.runtime.sendMessage({ type: "updateRedirectRules" });
};

function restoreOptions() {
    chrome.storage.sync.get(
        ["redirectLink", "urlMatchPatterns"],
        (items) => {
            document.getElementById("redirect-link").value = items.redirectLink;
            document.getElementById("url-match-patterns").value = items.urlMatchPatterns.join("\n");
        }
    );
};

const statusElem = document.getElementById("status");
function showStatus(text) {
    statusElem.textContent = text;
    setTimeout(() => {
        statusElem.textContent = "";
    }, 750);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);

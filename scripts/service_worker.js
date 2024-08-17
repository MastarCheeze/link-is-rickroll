chrome.runtime.onInstalled.addListener((details) => {
    chrome.storage.sync.set({
        redirectLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        urlMatchPatterns: ["google.com"],
        activated: true,
    });
    updateBadge(true);
    updateRedirectRules(true);
});

chrome.runtime.onStartup.addListener(() => {
    chrome.storage.sync.get(["activated"]).then((result) => {
        updateBadge(result.activated);
        updateRedirectRules(result.activated);
    });
});

chrome.action.onClicked.addListener((tab) => {
    chrome.storage.sync.get(["activated"]).then((result) => {
        chrome.storage.sync.set({ activated: !result.activated });
        updateBadge(!result.activated);
        updateRedirectRules(!result.activated);
    });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "updateRedirectRules") {
        chrome.storage.sync.get(["activated"]).then((result) => {
            updateRedirectRules(result.activated);
        });
    }
});

async function updateRedirectRules(activated) {
    if (activated) {
        chrome.storage.sync.get(["redirectLink", "urlMatchPatterns"], async (items) => {
            const newRules = items.urlMatchPatterns
                .entries()
                .map(([i, pattern]) => {
                    return {
                        action: { redirect: { url: items.redirectLink }, type: "redirect" },
                        condition: { urlFilter: pattern, resourceTypes: ["main_frame"] },
                        id: i + 1,
                    };
                })
                .toArray();

            setRedirectRules(newRules);
        });
    } else {
        setRedirectRules([]);
    }
}

async function setRedirectRules(rules) {
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map((rule) => rule.id);

    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: oldRuleIds,
        addRules: rules,
    });
}

function updateBadge(activated) {
    if (activated) {
        chrome.action.setBadgeText({ text: "ON" });
        chrome.action.setBadgeBackgroundColor({ color: "#50C878" });
    } else {
        chrome.action.setBadgeText({ text: "OFF" });
        chrome.action.setBadgeBackgroundColor({ color: "#A9A9A9" });
    }
}

// edge case for chrome:// urls
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    chrome.storage.sync.get(
        ["redirectLink", "urlMatchPatterns", "activated"],
        (result) => {
            if (result.activated) {
                for (pattern of result.urlMatchPatterns) {
                    if (pattern.startsWith("chrome://") && changeInfo.url.includes(pattern)) {
                        chrome.tabs.update(null, { url: result.redirectLink });
                        break;
                    }
                }
            }
        }
    );
});

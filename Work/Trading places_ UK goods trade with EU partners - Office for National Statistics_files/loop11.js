Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};

window.l11_functions = window.l11_functions || (function() {
    "use strict";
    var set = function setF(name, value, expires, domain, doNotEncode) {
        var estring = "";
        if (expires) {
            var date = new Date();
            date.setTime(date.getTime() + (expires * 1000));
            estring += " expires=" + date.toGMTString() + ";";
        }
        if (domain) {
            estring += " domain=" + domain + ";";
        }
        if (value !== null && doNotEncode !== null && !doNotEncode) {
            value = encodeURIComponent(value);
        }
        document.cookie = name + "=" + value + ";" + estring + " path=/";
    };
    var unset = function unsetF(name, domain) {
        if (get(name, false) !== null) {
            set(name, "", -86400, domain);
        }
    };
    var get = function getF(name, doNotDecode) {
        var cookies = document.cookie.split(";"),
            rcookie = null;

        for (var i = 0; i < cookies.length; i++) {
            var n = cookies[i];

            while (" " === n.charAt(0)) {
                n = n.substring(1, n.length);
            }

            var eqOffset = n.indexOf("=");

            if (n.substring(0, eqOffset) === name) {
                //if (0 == n.indexOf(name)) {
                //rcookie = n.substring(name.length + 1, n.length);
                rcookie = n.substring(eqOffset + 1, n.length);
                break;
            }
        }

        if (rcookie !== null && doNotDecode !== null && doNotDecode !== true) {
            rcookie = decodeURIComponent(rcookie);
        }
        return rcookie;
    };


    // Only a minimal amount of l11_functions event handling is included in order to keep size down.
    var isReady = false;
    var readyStateHandlers = null;
    //the following bits are lifted from jquery's ready detection
    var addReadyTrigger = function addReadyTriggerF() {
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", completed, false);
            window.addEventListener("load", completed, false);
        } else {
            document.attachEvent("onreadystatechange", completed);
            window.attachEvent("onload", completed);
            var top = false;
            try {
                top = window.frameElement === null && document.documentElement;
            } catch (e) {}
            if (top && top.doScroll) {
                (function doScrollCheck() {
                    if (!isReady) {
                        try {
                            top.doScroll("left");
                        } catch (e) {
                            return window.setTimeout(doScrollCheck, 50);
                        }
                        detach();
                        handleReady(arguments);
                    }
                })();
            }
        }
    };

    var addReadyStateHandler = function addReadyStateHandlerF(fn) {
        if (document.readyState === "complete") {
            window.setTimeout(fn, 0);
            return;
        }
        if (readyStateHandlers === null) {
            readyStateHandlers = [fn];
            addReadyTrigger();
        } else {
            readyStateHandlers.push(fn);
        }
    };

    var completed = function(event) {
        if (document.addEventListener || event.type === "load" || document.readyState === "complete") {
            detach();
            handleReady.apply(this, arguments);
        }
    };

    var detach = function() {
        if (document.addEventListener) {
            document.removeEventListener("DOMContentLoaded", completed, false);
            window.removeEventListener("load", completed, false);
        } else {
            document.detachEvent("onreadystatechange", completed);
            window.detachEvent("onload", completed);
        }
    };

    var handleReady = function handleReadyF() {
        for (var i = 0; i < readyStateHandlers.length; i++) {
            try {
                readyStateHandlers[i].apply(this, arguments);
            } catch (e) {}
        }
    };

    var addListener = function(event, target, handler) {
        if (target.addEventListener) {
            target.addEventListener(event, handler, false);
        } else if (window.attachEvent) {
            target.attachEvent('on' + event, handler);
        }
    };

    return {
        "addReadyStateHandler": addReadyStateHandler,
        "addListener": addListener,
        "cookies": {
            "set": set,
            "unset": unset,
            "get": get
        }
    };
})();


window.loop11Loader = (function() {
    "use strict";

    var environment = getEnvironmentInUrl(),
        defaultDomain,
        defaultCdnDomain;

    switch (environment) {
    case "staging":
        defaultDomain = "staging.loop11.com";
        defaultCdnDomain = "cdn.staging.loop11.com";
        break;
    case "docker":
        defaultDomain = "localhost:8000";
        defaultCdnDomain = "localhost:8000";
        break;
    default:
        defaultDomain = "www.loop11.com";
        defaultCdnDomain = "cdn.loop11.com";
    }

    var domain = getClientOption("loop11domain", defaultDomain),
        cdndomain = getClientOption("loop11cdndomain", defaultCdnDomain),
        cookieDomain = getClientOption("cookieDomain", null),
        uiType = getUIType(false),
        isCrossDomain = getClientOption('crossDomainSupport', false),
        key = typeof window.loop11_key === "undefined" ? null : window.loop11_key,
        style = "triton/css/taskbar",
        staticPath = '/static/',
        stylePath = '/media/triton/css/',
        jsPath = '/media/triton/js/',
        ieStyle = "triton/css/ie",
        popupBox = null,
        overlay = null,
        ui = {
            "lang": "en",
            "dir": "ltr",
            "move": "move",
            "hide": "hide",
            "show": "show",
            "exit": "exit",
            "loading": "Loading, please wait.",
            "exit_conf": "Exit user test?",
            "complete": "Complete",
            "mandatory": "This question is required.",
            "resume": "Resume test",
            "begin": "Begin Evaluation",
            "popupExit": "Exit",
            "popupBegin": "Begin Evaluation"
        },
        crossDomainIframe = null; // handle to the iFrame used for cross-domain support when using localStorage approach

    var tritonBaseUrl = "//" + domain + "/triton/" + (key ? key + "/" : ""),
        tritonTimestampedUrl = "//" + domain + "/triton/time/" + (new Date()).getTime() + "/" + (key ? key + "/" : ""),
        cdnBaseUrl = "//" + cdndomain + "/media/";
    //for the various interfaces, the libraries which must be included for the interface
    var uiLibs = {
        'triton.1': ['embed.full'],
        'triton.2': ['triton.2']
    };

    // NOTE(Tomas) this is interim measure to disable recorder for usertests in this list
    var noRecorderL11Uids = [
        '36087'
    ];

// LOOP11_START
	// NOTE(Tomas): re-generate file hashes run ./www.loop11.com/media/triton/js/generate-checksums.sh
    var libUrls = {
      'embed.full': cdnBaseUrl + 'triton/js/loop11ui-desktop.js?v=5854d121618218b8f00acdabadf2711b8e49fd81',
      'triton.2': cdnBaseUrl + 'triton/js/loop11ui-mobile.js?v=883cfa845c198f53b50eaf12a7bf606970ea4e41',
      'clickview': cdnBaseUrl + 'triton/js/clickview-heatmap.js?v=312ea41888e824f7b71d366c8dd40f9a7abda6bc',
      'clickrecord': cdnBaseUrl + 'triton/js/clickrecord.js?v=e142fb3490a2987c1c07070546200d0ef84c0ab6',
      'usertest': cdnBaseUrl + 'triton/js/usertest.js?v=dd9b59668c3a75c40862549b3b1e39e01021f392',
      'inject_recorder': cdnBaseUrl + 'triton/js/inject-recorder.js?v=becbc43941c5d30030d029b61dd37fdab1eef28d'};
    // LOOP11_END

    var mode = {
            "popup": "popup",
            "general_preview": "general-preview",
            "preview": "preview",
            "heatmap_view": "heatmap-view"
        },
        sessionItems = ["l11_mode", "l11_uid", "l11_pid", "l11_ot", "l11_oid", "l11_action", "l11_env"],
        session = null,
        crossDomainUrl = {
            'legacy': tritonTimestampedUrl + "getsession",
            'cookies': 'https:' + cdnBaseUrl + 'triton/html/crossdomain-cookies.html', // Force SSL, because the file will be cached anyway and better to cache on single protocol
            'localStorage': 'https:' + cdnBaseUrl + 'triton/html/crossdomain-localstorage.html' // Need to force SSL because otherwise session data will not be shared across protocols
        };


    function outputScript(url, synchronous, callbackFn) {
        if (synchronous) {
            //If the document readyState
            if (document.readyState === "loading") {
                var scriptId = 'loop11_script_' + (new Date()).getTime();
                try {
                    // If the document.write has been ignored because the script is deferred, the element will not exist.
                    document.write(unescape("%3cscript id='" + scriptId + "' src='" + url + "' type='text/javascript'%3e%3c/script%3e"));
                    if (document.getElementById(scriptId)) {
                        return true;
                    }
                } catch (e) {}
            }
        }
        var script = document.createElement("script");
        script.src = url;
        script.type = "text/javascript";
        if (callbackFn) {
            var hasRun = false;
            script.onload = script.onreadystatechange = function() {
                // lifted from jQuery
                if (!hasRun && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                    hasRun = true;
                    callbackFn();
                }
            };
        }
        document.getElementsByTagName("head")[0].appendChild(script);
        return false;
    }


    //Output one or more scripts (must be passed as array) and make a callback only when all of them have been loaded (ideally; in practice, it is a bit less reliable)
    function outputScripts(urls, synchronous, callbackFn) {
        callbackFn = callbackFn || function() {}; // this is a hack because we need to get this released.
        //count each script completing
        var completeCounter = urls.length;
        var completeAccumulator = function(evt) {
            if (--completeCounter === 0) {
                callbackFn(evt);
            }
        };
        for (var i = 0; i < urls.length; i++) {
            //if synchronous, then callbacks don't happen so we count each synchronous inclusion and decrement the counter
            if (outputScript(urls[i], synchronous, completeAccumulator) && synchronous) {
                if (--completeCounter === 0) {
                    callbackFn();
                }
            }
        }
    }

    // sessionData param is used for cross-domain support, and should not be used otherwise
    function init(sessionData, initData) {
        // If running inside parser, then
        if (window.l11_parser) {
            return;
        }

        if (typeof(initData) !== "undefined" &&
            "l11_uid" in initData) {
            session = initData;
        }

        if (getClientOption("crossDomainSupport", false)) {
            if (!sessionData) {
                getCrossDomainSession();
                return;
            } else if ("l11_uid" in sessionData) {
                session = sessionData;
            }
        }

        checkSessionInClientOptions();
        checkSessionInCookies();
        checkSessionInUrl();
        checkPopup();
        if (key !== null) {
            checkTest();
        }
    }

    function checkTest() {
        if (session !== null && "l11_uid" in session) {
            if (("l11_mode" in session && session.l11_mode !== mode.popup) || !("l11_mode" in session)) {
                // If the file is included synchronously, then the function will never execute. However, if
                // it can't be included synchronously (I'm looking at you, IE8) for some reason the function will make
                // sure the test gets triggered
                outputScripts(getUILibUrls(), true);
            }
        }
    }

    /**
     * Calculate if invitation pop-up should be presented, and if so display it
     */
    function checkPopup() {
        if (session === null && typeof window.loop11_pp !== "undefined") {
            //build cookie name based on uid set in embed
            var cname = "l11_popup" + window.loop11_pp[1],
                cvalue = window.l11_functions.cookies.get(cname);

            //if we don"t have a cookie yet, run the usertest
            if (cvalue === null) {
                window.l11_functions.cookies.set(cname, 1, 12960000, cookieDomain);

                //check if to show popup based on give probability
                if (Math.floor(Math.random() * 100) <= window.loop11_pp[0]) {
                    session = {
                        "l11_uid": window.loop11_pp[1],
                        "l11_mode": mode.popup
                    };
                    if (window.loop11_pp[2]) {
                        session.l11_action = "poseidon";
                    }
                    storeSession();
                }
            }
        }
        if (session !== null && session.l11_mode && session.l11_mode === mode.popup) {
            window.l11_functions.addReadyStateHandler(function() {
                outputScript(buildSessionUrl());
            });
        }
    }

    function clearSession() {
        for (var i = 0; i < sessionItems.length; i++) {
            window.l11_functions.cookies.unset(sessionItems[i], cookieDomain);
        }
    }

    function checkSessionInClientOptions() {
        if (clientOptionPresent("sessiondata")) {
            var sessiondata = getClientOption("sessiondata");
            session = session || {};

            for (var i = 0; i < sessionItems.length; i++) {
                var name = sessionItems[i];

                if (name in sessiondata) {
                    if (!sessiondata.hasOwnProperty(name)) {
                        continue;
                    }
                    session[name] = sessiondata[name];
                }
            }
        }
    }

    function checkSessionInCookies() {
        if (window.l11_functions.cookies.get("l11_uid") !== null) {
            session = session || {};

            for (var i = 0; i < sessionItems.length; i++) {
                var name = sessionItems[i];

                var value = window.l11_functions.cookies.get(name);
                if (value !== null) {
                    session[name] = value;
                }
            }
        }
    }

    function checkSessionInUrl() {
        var qstring = document.location.search,
            qvalue = {};
        qstring = "/" === qstring.charAt(qstring.length - 1) ? qstring.substring(0, qstring.length - 1) : qstring;
        qstring.replace(new RegExp("([^?=&;]+)(=([^&;]*))?", "g"), function($0, $1, $2, $3) {
            qvalue[$1] = $3;
        });

        if ("l11_uid" in qvalue || qvalue.l11_mode === mode.general_preview) {
            session = session || {};

            for (var i = 0; i < sessionItems.length; i++) {
                var name = sessionItems[i];
                if (name in qvalue) {
                    session[name] = qvalue[name];
                }
            }
        }
    }

    function storeSession() {
        if (!getClientOption("crossDomainSupport", false)) {
            for (var i = 0; i < sessionItems.length; i++) {
                var name = sessionItems[i];

                if (typeof session[name] !== "undefined" && session[name] !== null) {
                    window.l11_functions.cookies.set(name, session[name], null, cookieDomain);
                } else {
                    window.l11_functions.cookies.unset(name, cookieDomain);
                }
            }
        }
    }

    /**
     * Retrieve the session data constructed by the loader (from cookies, URL, and cross-domain).
     *  Note: this can contain 'l11_show_taskbar', which is not expected elsewhere so should be read and stripped
     *   after getting session
     * @returns {*}
     */
    function getSession() {
        return session;
    }

    function buildSessionUrl() {
        var url = tritonTimestampedUrl;

        for (var i = 0; i < sessionItems.length; i++) {
            var name = sessionItems[i];
            if (session[name]) {
                url += session[name] + "/";
            }
        }

        return url;
    }

    /**
     * Trigger loading of session data using cross-domain supported method.
     * When session data loaded, init should be triggered again (e.g. by the cross-domain session data page, or
     *  by a message) with session data as first arg
     */
    function getCrossDomainSession() {
        var elem;
        // IE7 doesn't support cross domain messaging or local storage; use server-cookies method
        if (isIE7()) {
            // add request for cross domain data from server
            outputScript(crossDomainUrl.legacy, true);
        } else {
            //ahoist mateys! should probably reorder functions to not rely on hoisting...
            window.l11_functions.addListener('message', window, handleCrossDomainMessage);
            crossDomainIframe = elem = document.createElement('iframe');
            elem.src = crossDomainUrl.cookies;
            elem.style.display = 'none';
            elem.style.width = '0px';
            elem.style.height = '0px';
            document.body.appendChild(elem);
        }
    }

    /**
     * Receiver for cross-domain messages used for cross-domain session handling.
     * Checks if source of message is *.loop11.com, checks for fromLoop11 flag, then loads session data.
     * @param evt
     */
    function handleCrossDomainMessage(evt) {
        if (!((/^https?:\/\/[a-z0-9.]+\.loop11\.com/i).test(evt.origin))) {
            return;
        }

        // Can't control input, because it could be from a customer script, so need to expect exceptions
        try {
            var data = JSON.parse(evt.data);
            // Check for Loop11 marker to identify a message from Loop11
            if (!data || !data.fromLoop11 || !data.action) return;
            switch (data.action) {
            case 'getSessionResult':
                init(data.session);
            }
        } catch (e) {}
    }


    function showPopup(data) {
        addCss(data);
        ui = data.ui || ui;
        var popupboxData = data.popupbox;
        popupBox = createBaseUIElement("div");
        popupBox.setAttribute("id", "loop11-popupbox");
        popupBox.setAttribute("aria-labelledby", "loop11-popupbox");
        popupBox.innerHTML = "<p>" + popupboxData.content + "</p>";

        //add buttons - unlike other panels, these are controlled by the usertest
        var buttons = document.createElement("div");
        buttons.setAttribute("id", "loop11-lightbox-buttons");

        //Begin evaluation
        var beginFn;
        //popupboxData will always include "redirect" for Parser
        if (popupboxData.redirect) {
            beginFn = function() {
                clearSession();
                document.location.href = popupboxData.redirect;
            };
        } else {
            beginFn = function() {
                delete session.l11_mode;
                window.l11_functions.cookies.unset("l11_mode", cookieDomain);
                popupBox.parentNode.removeChild(popupBox);
                outputScripts(getUILibUrls(), false);
            };
        }
        //else {
        //    begin.onclick = function () {
        //        clearMode();
        //        l11_embedded.runUsertest()
        //    };
        //}

        buttons.appendChild(createButton("exit", ui.popupExit, null, null, exitUsertest));
        buttons.appendChild(createButton("begin", ui.popupBegin, data.theme ? null : "loop11-begin", null, beginFn));
        popupBox.appendChild(buttons);
        insertNode(popupBox);

        if (verifyStyle(popupBox, "position") !== "absolute") {
            popupBox.style.display = "none";
            waitForStyle("loop11-popupbox", true);
        }

        updateBoxPosition(popupBox);
        displayOverlay();
        createAriaAlert();

        window.scroll(0, 0);
        var bg_button = window.document.getElementsByClassName('loop11-begin')[0];

        if (bg_button) {
            bg_button.setAttribute('autofocus', 'autofocus');
            bg_button.focus();
        }


    }

    function createAriaAlert() {
        var aler = document.getElementById('newContentAnnounce');

        if (!aler) {
            var myAlert = document.createElement("div");
            myAlert.setAttribute("id", "newContentAnnounce");
            myAlert.setAttribute("role", "alert");
            myAlert.setAttribute("aria-atomic", "true");
            myAlert.style.color = "white";
            myAlert.style.position = "absolute";
            myAlert.style.height = "1px";
            myAlert.style.width = "1px";
            myAlert.style.fontSize = "1px";
            myAlert.style.clip = "rect(0px,0px,0px,0px)";
            document.body.appendChild(myAlert);

            myAlert = document.getElementById('newContentAnnounce');
            myAlert.appendChild(document.createTextNode("Please be patient as page loads."));
            //toggle visibility from visible to hidden and back again
            myAlert.style.visibility = 'hidden';
            myAlert.style.visibility = 'visible';
        } else {

            var elem1 = document.getElementById('newContentAnnounce');
            elem1.style.clip = 'rect(0px,0px,0px,0px)';
            elem1.innerHTML = "";
            elem1.style.visibility = 'hidden';

        }
    }

    function createButton(name, value, cls, id, onClickFn) {
        var elem = document.createElement("input");
        elem.setAttribute("type", "button");
        if (name !== null) {
            elem.setAttribute("name", name);
        }
        if (value !== null) {
            elem.setAttribute("value", value);
        }
        if (cls !== null) {
            elem.setAttribute("class", cls);
        }
        if (id !== null) {
            elem.setAttribute("id", id);
        }
        if (onClickFn !== null) {
            elem.onclick = onClickFn;
        }
        return elem;
    }

    function addCss(data) {
        var themed = data.theme || false;

        var links = document.getElementsByTagName("link");
        var found = false;
        var styleUrl = null;

        if (themed) {
            styleUrl = tritonBaseUrl + "usertest-style/" + data.session.l11_uid + "/css";
        } else if (ui.dir === "ltr") {
            styleUrl = cdnBaseUrl + style + ".css";
        } else {
            styleUrl = cdnBaseUrl + style + "rtl.css";
        }

        for (var i = 0; i < links.length; i++) {
            if (links[i].getAttribute("href") === styleUrl) {
                found = true;
                break;
            }
        }

        if (!found) {
            var css = document.createElement("link");
            css.setAttribute("rel", "stylesheet");
            css.setAttribute("type", "text/css");
            css.setAttribute("href", styleUrl);

            document.getElementsByTagName("head")[0].appendChild(css);

            if (isIe() !== null) {
                var iecss = document.createElement("link");
                iecss.setAttribute("rel", "stylesheet");
                iecss.setAttribute("type", "text/css");
                if (ui.dir === "ltr") {
                    iecss.setAttribute("href", cdnBaseUrl + ieStyle + ".css");
                } else {
                    iecss.setAttribute("href", cdnBaseUrl + ieStyle + "rtl.css");
                }
                document.getElementsByTagName("head")[0].appendChild(iecss);
            }
        }
    }

    function isIE7() {
        return (/Mozilla\/[1-4].0\s*\(.*?MSIE\s*[1-7]\./i).test(navigator.userAgent);
    }

    function isIe() {
        var ie = null;

        if (typeof document.body.style.scrollbar3dLightColor !== "undefined") {
            if (typeof document.body.style.opacity !== "undefined") {
                ie = "IE9";
            } else if (typeof document.body.style.msBlockProgression !== "undefined") {
                ie = "IE8";
            } else if (typeof document.body.style.msInterpolationMode !== "undefined") {
                ie = "IE7";
            } else if (typeof document.body.style.textOverflow !== "undefined") {
                ie = "IE6";
            } else {
                ie = "IE5.5";
            }
        }

        return ie;
    }

    function insertNode(node) {
        if (node) {
            if (document.body.childNodes.length > 0) {
                document.body.insertBefore(node, document.body.childNodes[0]);
            } else {
                document.body.appendChild(node);
            }
        }
    }

    function createBaseUIElement(name) {
        var node = document.createElement(name);
        node.setAttribute("lang", ui.lang);
        node.setAttribute("dir", ui.dir);
        // node.setAttribute("aria-live", "assertive");
        return node;
    }

    //SM: I don"t know why this is required; it predates me
    function verifyStyle(element, rule) {
        var value = "";

        if (document.defaultView && document.defaultView.getComputedStyle) {
            value = document.defaultView.getComputedStyle(element, "").getPropertyValue(rule);
        } else if (element.currentStyle) {
            rule = rule.replace(/\-(\w)/g, function(_match, p1) {
                return p1.toUpperCase();
            });
            value = element.currentStyle[rule];
        }
        return value;
    }

    //callback function that checks if the stylesheet is loaded
    //boxid - the id attribute of the box to check
    //update - boolean: whether to update the position of the box
    function waitForStyle(boxid, update) {
        //show the box
        var box = document.getElementById(boxid);

        if (box) {
            if (verifyStyle(box, "position") !== "absolute") {
                setTimeout(function() {
                    waitForStyle(boxid, update);
                }, 250);
            } else if (update) {
                var pageheight = getViewport()[1];
                box.style.display = "block";
                updateBoxPosition(box);

                if (boxid === "loop11-lightbox-task-panel") {
                    updateHeight("loop11-lightbox-scroll", pageheight);
                }
            } else {
                box.style.display = "block";
            }
        }
    }


    /**
     * Choose triton interface based on client options and browser characteristics.
     * If a ui type is explicitly set, use that (by default); force all old browsers to the 'old' interface; detect
     * viewport width and if too small for triton, send to 'new' triton.
     * All (significant) mobile browsers that support window.matchMedia seem to (as of 2015-05-04)
     * correctly report viewport size prior to the onload event *except* Firefox for Android. It is wrong until onload.
     * Android 2.x doesn't support window.mediaMatch, but can be checked *after onload* with
     * document.body.clientWidth
     *
     * @param ignoreClientOptions If true, ignore explicit UI set in clientOptions
     * @returns name of UI library to use
     */
    function getUIType(ignoreClientOptions) {
        // IE < 8 isn't supported by triton.2 at all.
        if (isIE7()) {
            return "triton.1";
        }

        var viewportElem,
            viewportContent,
            useInterface = getClientOption("ui", null);

        // 885px was chosen because that is the smallest width on which the standard Triton taskbar will fit.
        var useMobIfWidthELT = 885;

        if (useInterface && !(ignoreClientOptions)) {
            return useInterface;
        } else {
            useInterface = "triton.1";
        }

        if (document.readyState !== "complete") {
            // Detect 'likely mobile' browsers which don't have trustworthy screen/page size values until after loading
            if (navigator.userAgent.match(/android;.*?mobile.*?firefox|android 2[.0-9]+.*version\/4\.0 mobile/gi)) {
                viewportElem = document.querySelector('meta[name="viewport"]');
                // check if the site is likely to be scale for mobile
                if (viewportElem) {
                    viewportContent = viewportElem.content;
                    if (viewportContent && (/width\s*=\s*(?:320|device-width)|height\s*=\s*device-height/i).test(viewportContent)) {
                        //Probably on a responsive site
                        return "triton.2";
                    }
                }
            }
        }

        // If load is complete, trust window size info from any browser
        if (window.matchMedia) {
            if (window.matchMedia("(max-width: " + useMobIfWidthELT + "px)").matches) {
                useInterface = "triton.2";
            }
        } else if (document.documentElement.clientWidth <= useMobIfWidthELT) {
            useInterface = "triton.2";
        }

        return useInterface;
    }


    function initIfCorrectUI(loadedUIType, initFn) {
        uiType = getUIType(false);
        if (loadedUIType === uiType) {
            // correct interface - start it
            initFn();
        } else {
            // wrong interface: insert scripts for the correct one
            outputScripts(getUILibUrls());
        }
    }


    function getViewport() {
        var viewport_width;
        var viewport_height;

        if (typeof window.innerWidth !== "undefined") {
            viewport_width = window.innerWidth;
            viewport_height = window.innerHeight;
        } else if (typeof document.documentElement !== "undefined" && typeof document.documentElement.clientWidth !== "undefined" && document.documentElement.clientWidth !== 0) {
            viewport_width = document.documentElement.clientWidth;
            viewport_height = document.documentElement.clientHeight;
        } else {
            viewport_width = document.getElementsByTagName("body")[0].clientWidth;
            viewport_height = document.getElementsByTagName("body")[0].clientHeight;
        }

        return [viewport_width, viewport_height];
    }

    //update the position of the given box/block by centering it vertically on the screen.
    function updateBoxPosition(box) {
        if (box) {
            var viewport_height = getViewport()[1];
            var l_top = Math.round((viewport_height / 2) - box.offsetHeight / 2);

            if (l_top > 0) {
                box.style.top = l_top + "px";
            } else {
                box.style.top = "1px";
            }
        }
    }

    function updateHeight(boxid, maxHeight) {
        var box = document.getElementById(boxid);

        if (box) {
            var boxheight = box.offsetHeight;

            //TODO: hard coded only for loop11-lightbox-text
            var offsetheight = 85;

            if (boxheight > maxHeight) {
                if (offsetheight <= maxHeight - offsetheight) {
                    boxheight = maxHeight - offsetheight;
                } else {
                    boxheight = offsetheight;
                }
                box.style.height = boxheight + "px";
            }
        }
    }

    //Display an overlay over the content. Note that the height is not set, and will need to be set later based on the content on top of the overlay
    function displayOverlay() {
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.setAttribute("id", "loop11overlay");
            overlay.style.height = getPageHeight() + "px";
            document.body.appendChild(overlay);
        }
    }

    function getPageHeight() {
        var yScroll;
        var windowHeight;
        var pageHeight;

        if (window.innerHeight && window.scrollMaxY) {
            yScroll = window.innerHeight + window.scrollMaxY;
        } else if (document.body.scrollHeight > document.body.offsetHeight) {
            yScroll = document.body.scrollHeight;
        } else if (document.documentElement && document.documentElement.scrollHeight > document.documentElement.offsetHeight) {
            yScroll = document.documentElement.scrollHeight;
        } else {
            yScroll = document.body.offsetHeight;
        }

        if (window.innerHeight) {
            windowHeight = window.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) {
            windowHeight = document.documentElement.clientHeight;
        } else if (document.body) {
            windowHeight = document.body.clientHeight;
        }

        if (yScroll < windowHeight) {
            pageHeight = windowHeight;
        } else {
            pageHeight = yScroll;
        }

        return pageHeight;
    }

    //remove the user test
    function exitUsertest() {
        if (window.confirm(ui.exit_conf)) {
            clearSession();
            popupBox.parentNode.removeChild(popupBox);
            overlay.parentNode.removeChild(overlay);
        }
    }

    function getLibUrl(libId) {
        if (libId === 'inject_recorder' &&
            'l11_uid' in session &&
            noRecorderL11Uids.contains(session.l11_uid)) {
            return undefined;
        }
        if (libId in libUrls) {
            return libUrls[libId];
        }
        return undefined;
    }

    function getLibUrls(libIds) {
        var outputUrls = [];
        for (var i = 0; i < libIds.length; i++) {
            if (libIds[i] in libUrls) {
                outputUrls.push(libUrls[libIds[i]]);
            }
        }
        return outputUrls;
    }

    function getUILibUrls(desiredUIType) {
        desiredUIType = desiredUIType || uiType;
        return getLibUrls(uiLibs[desiredUIType]);
    }

    function getConfig() {
        return {
            domain: domain,
            cdndomain: cdndomain,
            cookieDomain: cookieDomain,
            uiType: uiType,
            isCrossDomain: isCrossDomain,
            key: key,
            stylePath: stylePath,
            staticPath: staticPath,
            jsPath: jsPath
        };
    }

    function getClientOption(clientOptionName, defaultIfNotPresent) {
        var clientOptions = window.l11_clientOptions || {};
        if (clientOptionName in clientOptions) {
            return clientOptions[clientOptionName];
        } else {
            return defaultIfNotPresent;
        }
    }

    function getEnvironmentInUrl() {
        var qstring = document.location.search,
            qvalue = {};
        qstring = "/" === qstring.charAt(qstring.length - 1) ? qstring.substring(0, qstring.length - 1) : qstring;
        qstring.replace(new RegExp("([^?=&;]+)(=([^&;]*))?", "g"), function($0, $1, $2, $3) {
            qvalue[$1] = $3;
        });

        if ("l11_env" in qvalue) {
            return qvalue.l11_env;
        } else {
            return "production";
        }
    }

    function clientOptionPresent(clientOptionName) {
        var clientOptions = window.l11_clientOptions || {};
        return clientOptionName in clientOptions;
    }

    function getCrossDomainIframe() {
        return crossDomainIframe;
    }

    return {
        "init": init,
        "popup": showPopup,
        "getSession": getSession,
        "getConfig": getConfig,
        "getLibUrl": getLibUrl,
        "getLibUrls": getLibUrls,
        "getUILibUrls": getUILibUrls,
        "outputScript": outputScript,
        "outputScripts": outputScripts,
        "initIfCorrectUI": initIfCorrectUI,
        "getCrossDomainIframe": getCrossDomainIframe
    };
})();


window.loop11Loader.init();
//window["addEventListener"]("load", function(){window["loop11Loader"].init();});

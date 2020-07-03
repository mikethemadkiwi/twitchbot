ipcMain.on('twitch-login', (event, arg) => {

    let type = arg;


    /*GET https://id.twitch.tv/oauth2/authorize
    ?client_id=<your client ID>
    &redirect_uri=<your registered redirect URI>
    &response_type=<type>
    &scope=<space-separated list of scopes> */


    // Twitch Applications Credentials
    //twitch clientID clientID
    var options = {
        client_id: 'clientID',
        response_type: 'code',
        grant_type: 'authorization_code',
        scopes: "user:details:self interactive:robot:self chat:connect chat:chat chat:whisper chat:bypass_links chat:bypass_slowchat chat:bypass_catbot chat:bypass_filter chat:clear_messages chat:giveaway_start chat:poll_start chat:remove_message chat:timeout chat:view_deleted chat:purge channel:details:self channel:update:self channel:clip:create:self", // Scopes limit access for OAuth tokens.
        redirectUri: "http://localhost:8081/auth/twitch/callback"

    };

    let streamerRedirect = "http://localhost:8081/auth/twitch/callback";
    let botRedirect = "http://localhost:8081/auth/twitch/callback";

    let streamerScopes = "user_read";
    let botScopes = "chat:connect chat:chat chat:whisper chat:bypass_links chat:bypass_slowchat";
    let scopes = type === "streamer" ? streamerScopes : botScopes;
    let redirectUri = type === "streamer" ? streamerRedirect : botRedirect;



    //let _clientCredentials = _clientCredentials;
    this._currentScopes = new Set();
    this._allowUserChange = false;
    this.tokenType = 'user';


    const defaultOptions = {
        escapeToClose: true,
        closeOnLogin: true
    };

    let _options = Object.assign({}, defaultOptions, null);

    const redir = encodeURIComponent(redirectUri);
    const queryParams = {
        response_type: 'token',
        client_id: 'clientID',
        redirect_uri: redir,
        scope: scopes,
        force_verify: true,
    };


    var twitchUrl = 'https://id.twitch.tv/oauth2/authorize?';
    const authUrl = twitchUrl + 'client_id=' + queryParams.client_id + '&scope=' + queryParams.scope + '&response_type=' + queryParams.response_type + '&redirect_uri=' + queryParams.redirect_uri + '&force_verify=' + queryParams.force_verify;


    const defaultBrowserWindowOptions = {
        parent: mainWindow,
        width: 800,
        height: 600,
        show: false,
        modal: true,
        webPreferences: {
            nodeIntegration: false
        }
    };


    let done = false;

    const authWindow = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            partition: type,
            nodeIntegration: false,
        },
        escapeToClose: true,
        closeOnLogin: true
    });


    authWindow.webContents.once('did-finish-load', () => authWindow.show());
    authWindow.on('closed', () => {

        if (!done) {
            reject(new WindowClosedError());
        }
    });
    if (true) {
        authWindow.webContents.on('before-input-event', (_, input) => {
            switch (input.key) {
                case 'Esc':
                case 'Escape':
                    authWindow.close();
                    break;
                default:
                    break;
            }
        });
    }
    authWindow.webContents.session.webRequest.onBeforeRequest({ urls: ['http://localhost:8081/auth/twitch/callback'] }, (details, callback) => {
        const url = new URL(details.url);
        const match = url.origin + url.pathname;
        // sometimes, electron seems to intercept too much... we catch this here
        if (match !== 'http://localhost:8081/auth/twitch/callback') {
            // the trailing slash might be too much in the pathname
            if (url.pathname !== '/' || url.origin !== 'http://localhost:8081/auth/twitch/callback') {
                callback({});
                return;
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any


        var hash = url.hash.substr(1);

        var result = hash.split('&').reduce(function(result, item) {
            var parts = item.split('=');
            result[parts[0]] = parts[1];
            return result;
        }, {});

        const params = url.hash ? result : url.searchParams;
        if (params.error || params.access_token) {
            done = true;
            if (true) {
                authWindow.destroy();
            }
        }
        if (params.error) {
            //reject(new Error(`Error received from Twitch: ${params.error}`));

            //log the error here

        } else if (params.access_token) {

            //we have the access tokens for the authed
            const accessToken = params.access_token;
            for (const scope of scopes) {
                this._currentScopes.add(scope);
            }
            this._accessToken = {
                access_token: accessToken,
                scope: this.currentScopes,
                refresh_token: ''
            };

            //not sure what this is for
            this._allowUserChange = false;
            //resolve(this._accessToken);
            server.SaveAuthToken(true, this._accessToken);
        }
        callback({ cancel: true });
    });












    // if (1 == 1) {
    // authWindow.loa
    authWindow.loadURL(authUrl);
    authWindow.show();


    //authWindow.on()






})
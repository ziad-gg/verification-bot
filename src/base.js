const { default: axios } = require('axios');
const funcaptcha = require('funcaptcha');

const cookie = require('@/src/cookie');

class Base {

    static Logout = () => 'https://auth.roblox.com/v2/logout';
    static GroupJoin = (id) => `https://groups.roblox.com/v1/groups/${id}/users`;

    static toCookie = (_cookie) => _cookie ? `.ROBLOSECURITY=${_cookie}` : `${cookie}`;
    static toJson = (base64) => JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'))

    /**
     * @param {string} url 
     * @param {{ token: string, cookie: string }} auth 
     * @param {{ [key: string]: string | any}} body 
     * @param {{}} moreHeaders 
     */
    static async post(url, auth, body = {}, moreHeaders = {}) {
        const int = Math.floor(Math.random() * (799 - 103 + 1)) + 103;
        const proxy = `https://child-${int}.vercel.app/proxy`;

        const payload = {
            url: url || Base.GroupJoin(int),
            method: 'post',
            body: body,
            headers: {
                'X-Csrf-Token': auth?.token,
                'Cookie': auth?.cookie,
                ...moreHeaders
            },
            include: [
                'response-error-headers',
                'response-error-data',
            ]
        };

        const Attemp = await axios.post(proxy, { targets: [payload] }).catch(e => e.response);

        const Return = {
            headers: Attemp.data.responses[0]['response-error-headers'],
            body: Attemp.data.responses[0]['response-error-data']
        };

        return Return;
    };

    static async getToken(cookie) {
        const int = Math.floor(Math.random() * (799 - 103 + 1)) + 103;
        const proxy = `https://child-${int}.vercel.app/proxy`;

        const payload = {
            url: Base.Logout(),
            method: 'post',
            headers: {
                'Cookie': cookie,
            },
            include: [
                'response-error-headers'
            ]
        };

        const Req = await axios.post(proxy, { targets: [payload] }).catch(e => e.response);

        return Req.data.responses[0]['response-error-headers']['x-csrf-token'];
    };

    /**
     * 
     * @returns {string}
     */
    static async getIp() {
        const request = await axios.default.get('https://api.ipify.org/?format=json');
        return request.data.ip
    };

    static async getChallangeToken(decoded) {
        const challengeToken = await funcaptcha.getToken({
            pkey: "63E4117F-E727-42B4-6DAA-C8448E9B137F",
            surl: "https://roblox-api.arkoselabs.com",
            data: {
                "blob": decoded.dataExchangeBlob,
            },
            site: "https://www.roblox.com",
        });

        return challengeToken
    }

};

module.exports = Base
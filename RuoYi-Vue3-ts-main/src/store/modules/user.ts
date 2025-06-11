import { login, logout, getInfo } from '@/api/login';
import { loginApi as deLoginApi } from '@dataease/api/login';
import { useUserStoreWithOut as useDEUserStore } from '@dataease/store/modules/user';
import { getToken, setToken, removeToken } from '@/utils/auth';
import defAva from '@/assets/images/profile.jpg';
import { defineStore } from 'pinia';

const useUserStore = defineStore('user', {
    state: (): {
        token?: string;
        name: string;
        nickName: string,
        avatar: string;
        roles: any[];
        permissions: string[];
    } => ({
        token: getToken(),
        name: '',
        nickName: '',
        avatar: '',
        roles: [],
        permissions: [],
    }),
    actions: {
        // 登录
        login(userInfo: { username: string; password: string; code: string; uuid: string }) {
            const username = userInfo.username.trim();
            const password = userInfo.password;
            const code = userInfo.code;
            const uuid = userInfo.uuid;
            const deUserStore = useDEUserStore();
            return new Promise((resolve, reject) => {
                login(username, password, code, uuid)
                    .then(async (res: any) => {
                        setToken(res.token);
                        this.token = res.token;
                        try {
                            const deRes: any = await deLoginApi({ name: username, pwd: password });
                            deUserStore.setToken(deRes.data.token);
                        } catch (e) {
                            console.error('DataEase login failed', e);
                        }
                        resolve(1);
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        },
        // 获取用户信息
        getInfo() {
            return new Promise((resolve, reject) => {
                getInfo()
                    .then((res: any) => {
                        const user = res.user;
                        const avatar =
                            user.avatar === '' || user.avatar == null
                                ? defAva
                                : import.meta.env.VITE_APP_BASE_API + user.avatar;

                        if (res.roles && res.roles.length > 0) {
                            // 验证返回的roles是否是一个非空数组
                            this.roles = res.roles;
                            this.permissions = res.permissions;
                        } else {
                            this.roles = ['ROLE_DEFAULT'];
                        }
                        this.name = user.userName;
                        this.nickName = user.nickName;
                        this.avatar = avatar;
                        resolve(res);
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        },
        // 退出系统
        logOut() {
            return new Promise((resolve, reject) => {
                logout()
                    .then(() => {
                        this.token = '';
                        this.roles = [];
                        this.permissions = [];
                        removeToken();
                        resolve(1);
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        },
    },
});

export default useUserStore;

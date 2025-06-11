<template>
    <div class="navbar">
        <div class="logo"></div>
        <!-- <hamburger
            id="hamburger-container"
            :is-active="appStore.sidebar.opened"
            class="hamburger-container"
            @toggleClick="toggleSideBar"
        /> -->
        <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!settingsStore.topNav" />
        <top-nav id="topmenu-container" class="topmenu-container" v-if="settingsStore.topNav" />

        <div class="right-menu">
            <template v-if="appStore.device !== 'mobile'">
                <header-search id="header-search" class="right-menu-item" />

                <screenfull id="screenfull" class="right-menu-item hover-effect" />
            </template>
            <div class="avatar-container">
                <el-dropdown class="right-menu-item hover-effect"  trigger="click" @command="handleCommand" >
                    <div class="avatar-wrapper">
                        <!-- <img :src="userStore.avatar" class="user-avatar" /> -->
                        <span class="user-nickname"> {{ userStore?.nickName || '管理员' }} </span>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <router-link to="/user/profile">
                                <el-dropdown-item>个人中心</el-dropdown-item>
                            </router-link>
                            <el-dropdown-item divided command="logout">
                                <span>退出登录</span>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import Breadcrumb from '@/components/Breadcrumb/index.vue';
import TopNav from '@/components/TopNav/index.vue';
import Hamburger from '@/components/Hamburger/index.vue';
import Screenfull from '@/components/Screenfull/index.vue';
import SizeSelect from '@/components/SizeSelect/index.vue';
import HeaderSearch from '@/components/HeaderSearch/index.vue';
import RuoYiGit from '@/components/RuoYi/Git/index.vue';
import RuoYiDoc from '@/components/RuoYi/Doc/index.vue';
import useAppStore from '@/store/modules/app';
import useUserStore from '@/store/modules/user';
import useSettingsStore from '@/store/modules/settings';

const appStore = useAppStore();
const userStore = useUserStore();
const settingsStore = useSettingsStore();

function toggleSideBar() {
    appStore.toggleSideBar();
}

function handleCommand(command: any) {
    switch (command) {
        case 'setLayout':
            setLayout();
            break;
        case 'logout':
            logout();
            break;
        default:
            break;
    }
}

function logout() {
    ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(() => {
            userStore.logOut().then(() => {
                location.href = '/index';
            });
        })
        // .catch(() => {});
}

const emits = defineEmits(['setLayout']);
function setLayout() {
    emits('setLayout');
}
</script>

<style lang="scss" scoped>
.navbar {
    height: 56px;
    overflow: hidden;
    position: relative;
    background: #000;
    box-shadow: 0 1px 4px rgba(0,21,41,.08);
    .logo{
        width:132px;
        height:56px;
        background: url("../../assets/images/logotop1.png") no-repeat;
        background-size:100% 100%;
        float: left;
        margin-left: 30px;
        box-sizing:border-box;
    }
    .hamburger-container {
        line-height: 46px;
        height: 100%;
        float: left;
        cursor: pointer;
        transition: background 0.3s;
        -webkit-tap-highlight-color: transparent;

        &:hover {
            background: rgba(0, 0, 0, 0.025);
        }
    }

    .breadcrumb-container {
        float: left;
    }

    .topmenu-container {
        position: absolute;
        left: 200px;
        height:56px;
        border-width:0px;
        background-color:#000;
    }

    .errLog-container {
        display: inline-block;
        vertical-align: top;
    }

    .right-menu {
        float: right;
        height: 100%;
        line-height: 56px;
        display: flex;

        &:focus {
            outline: none;
        }

        .right-menu-item {
            display: inline-block;
            padding: 0 8px;
            height: 100%;
            font-size: 18px;
            color: #fffc;
            vertical-align: text-bottom;

            &.hover-effect {
                cursor: pointer;
                transition: background 0.3s;

                &:hover {
                    background: rgba(0, 0, 0, 0.025);
                }
            }
            &.theme-switch-wrapper {
                display: flex;
                align-items: center;

                svg {
                transition: transform 0.3s;
                
                &:hover {
                    transform: scale(1.15);
                }
                }
            }
        }

        .avatar-container {
            margin-right: 0px;
            padding-right: 0px;

            .avatar-wrapper {
                margin-top: 5px;
                right:5px;
                position: relative;

                .user-avatar {
                    cursor: pointer;
                    width: 30px;
                    height: 30px;
                    border-radius: 10px;
                }

                .user-nickname{
                    position: relative;
                    left: -5px;
                    bottom: -12px;
                    font-size: 14px;
                    font-weight: bold;
                    padding-left:11px;
                }


                i {
                    cursor: pointer;
                    position: absolute;
                    right: -20px;
                    top: 25px;
                    font-size: 12px;
                }
            }
        }
    }
}
</style>

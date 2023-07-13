<template>
    <view class="page-container page-bottom">
        <u-navbar :is-back="false" :title="navbarTitle" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="platform-container">
            <view class="platform-form">
                <view class="form-top flex flex-column-center flex-row-between">
                    <view class="form-title flex1 flex flex-column-center">
                        <image class="platform-icon" :src="platform.platformIcon" mode="aspectFill"></image>
                        <text class="platform-text flex1">{{ platform.platformName }}</text>
                    </view>
                    <button class="form-button flex-center" @tap="toRule(platform.ruleDataType)">
                        <text>绑定帮助</text>
                        <u-icon class="icon" name="question-circle"></u-icon>
                    </button>
                </view>
                <view class="form-content">
                    <view class="content-item flex flex-column-center" v-if="platform.type == 'binding'">
                        <view class="content-title">主页链接</view>
                        <view class="content-detail flex1">
                            <u-input type="text" v-model="platform.bindingUrl" :placeholder="'请提交' + platform.platformName + '个人主页链接'" height="90" input-align="right" />
                        </view>
                    </view>
                    <view class="content-item content-link flex" v-if="platform.type == 'change'">
                        <view class="content-title">主页链接</view>
                        <view class="content-detail flex1">{{ platform.bindingUrl }}</view>
                    </view>
                    <view class="content-item content-picture flex">
                        <view class="content-title">主页截图</view>
                        <view class="content-detail flex1 flex flex-row-end">
                            <view class="upload-picture" v-for="(item, index) in platform.bindingImg" :key="index">
                                <u-image @tap="$common.previewImage(platform.bindingImg, index)" :src="item.url" width="100%" height="100%" mode="aspectFill"></u-image>
                                <button @tap="$common.deletePicture(platform.bindingImg, index)" class="picture-delete" hover-class="active" v-if="item.isChange && platform.type == 'binding'"><u-icon name="close"></u-icon></button>
                                <button @tap="$common.reloadPicture(platform.bindingImg, index)" class="picture-reload" v-if="!item.isSuccess && item.uploadStatus == 'error'">重新上传</button>
                            </view>
                            <view class="upload-button" v-if="platform.bindingImg.length == 0">
                                <button @tap="$common.uploadPicture(platform.bindingImg)" hover-class="active"><u-icon name="plus"></u-icon></button>
                            </view>
                        </view>
                    </view>
                </view>

                <view class="form-content" v-if="platform.type == 'change'">
                    <view class="content-item flex flex-column-center">
                        <view class="content-title">新主页链接</view>
                        <view class="content-detail flex1">
                            <u-input type="text" v-model="platform.newBindingUrl" :placeholder="'请提交' + platform.platformName + '个人主页链接'" height="90" input-align="right" />
                        </view>
                    </view>
                    <view class="content-item content-picture flex">
                        <view class="content-title">新主页截图</view>
                        <view class="content-detail flex1 flex flex-row-end">
                            <view class="upload-picture" v-for="(item, index) in platform.newBindingImg" :key="index">
                                <u-image @tap="$common.previewImage(platform.newBindingImg, index)" :src="item.url" width="100%" height="100%" mode="aspectFill"></u-image>
                                <button @tap="$common.deletePicture(platform.newBindingImg, index)" class="picture-delete" hover-class="active" v-if="item.isChange"><u-icon name="close"></u-icon></button>
                                <button @tap="$common.reloadPicture(platform.newBindingImg, index)" class="picture-reload" v-if="!item.isSuccess && item.uploadStatus == 'error'">重新上传</button>
                            </view>
                            <view class="upload-button" v-if="platform.newBindingImg.length == 0">
                                <button @tap="$common.uploadPicture(platform.newBindingImg)" hover-class="active"><u-icon name="plus"></u-icon></button>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
            <view class="form-hint" v-if="platform.type == 'change'">链接解绑以后，原来申请的商品记录将全部被清除掉，请您谨慎解绑！</view>

            <button class="page-button" @tap="$u.throttle(submitBindingAccount, 500)">确认</button>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            navbarTitle: '',
            platform: {
                platformId: '',
                platformName: '',
                platformIcon: '',
                ruleDataType: '',
                bindingId: '',
                bindingUrl: '',
                bindingImg: [],
                newBindingUrl: '',
                newBindingImg: []
            }
        }),
        onLoad(data) {
            Object.assign(this.platform, data);
            if (this.$common.isNotEmpty(data.bindingId)) {
                this.requestBinding(data.bindingId);
            }
            if (this.platform.type == 'binding') {
                this.navbarTitle = '平台账号绑定';
            } else if (this.platform.type == 'change') {
                this.navbarTitle = '平台账号换绑';
            }
        },
        methods: {
            toRule(dataType) {
                this.$u.route('/pages/rule/rule', {
                    dataType: dataType,
                    ruleTitle: '绑定帮助'
                });
            },
            requestBinding(bindingId) {
                this.$u.post('/getBindingById', {
                    bindingId
                }).then(res => {
                    if (this.$common.isNotEmpty(res.data)) {
                        Object.assign(this.platform, res.data);
                        this.platform.bindingImg = this.$common.pictureToArray(this.platform.bindingImg);
                    }
                });
            },
            submitBindingAccount() {
                if (this.platform.type == 'binding') {
                    this.addBindingAccount();
                } else if (this.platform.type == 'change') {
                    this.changeBindingAccount();
                }
            },
            addBindingAccount() {
                if (!this.platform.bindingUrl) {
                    uni.showToast({
                        icon: 'none',
                        title: '请填写主页链接'
                    })
                    return false;
                }

                if (!this.$u.test.url(this.platform.bindingUrl)) {
                    uni.showToast({
                        icon: 'none',
                        title: '请填写正确的主页链接'
                    })
                    return false;
                }

                if (this.platform.bindingImg.length == 0) {
                    uni.showToast({
                        icon: 'none',
                        title: '请上传主页截图'
                    })
                    return false;
                }

                if (!this.$common.isPictureUpload(this.platform.bindingImg, '主页截图')) {
                    return false;
                }

                uni.showModal({
                    title: '提示',
                    content: '确定要绑定该账号链接吗？',
                    success: res => {
                        if (res.confirm) {
                            this.$u.post('/addBindingAccount', {
                                bindingTypes: this.platform.platformId,
                                bindingUrls: this.platform.bindingUrl,
                                bindingImgs: this.$common.pictureToString(this.platform.bindingImg)
                            }).then(res => {
                                uni.setStorageSync('bindingSuccess', true);
                                this.$common.getTemplate(this, 'userBinding', () => {
                                    uni.showToast({
                                        title: '提交成功'
                                    });
                                    setTimeout(() => {
                                        this.$u.route({
                                            type: 'back'
                                        });
                                    }, 200);
                                })
                            })
                        }
                    }
                })
            },
            changeBindingAccount() {
                if (!this.platform.newBindingUrl) {
                    uni.showToast({
                        icon: 'none',
                        title: '请填写主页链接'
                    })
                    return false;
                }

                if (!this.$u.test.url(this.platform.newBindingUrl)) {
                    uni.showToast({
                        icon: 'none',
                        title: '请填写正确的主页链接'
                    })
                    return false;
                }

                if (this.platform.newBindingImg.length == 0) {
                    uni.showToast({
                        icon: 'none',
                        title: '请上传主页截图'
                    })
                    return false;
                }

                if (!this.$common.isPictureUpload(this.platform.newBindingImg, '主页截图')) {
                    return false;
                }

                uni.showModal({
                    title: '提示',
                    content: '确定要绑定该账号链接吗？',
                    success: res => {
                        if (res.confirm) {
                            this.$u.post('/editBloggerId', {
                                bindingId: this.platform.bindingId,
                                bindingType: this.platform.platformId,
                                bindingUrl: this.platform.newBindingUrl,
                                bindingImg: this.$common.pictureToString(this.platform.newBindingImg)
                            }).then(res => {
                                uni.setStorageSync('bindingSuccess', true);
                                this.$common.getTemplate(this, 'userBinding', () => {
                                    uni.showToast({
                                        title: '提交成功'
                                    });
                                    setTimeout(() => {
                                        this.$u.route({
                                            type: 'back'
                                        });
                                    }, 200);
                                })
                            })
                        }
                    }
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .platform-container {
        .platform-form {
            .form-top {
                background: #fff;
                padding: 25rpx $space;
            }
            .form-title {
                width: 0;
                text-align: left;
                padding-right: 30rpx;
                .platform-text {
                    width: 0;
                    @include oneText;
                }
            }
            .form-button {
                @include fontStyle($color);
                .icon {
                    margin-left: 5rpx;
                    font-size: 32rpx;
                }
            }
            .form-content {
                background: #fff;
                padding: 0 $space;
                &:nth-child(3) {
                    margin-top: 20rpx;
                    .content-item {
                        &:nth-child(1) {
                            border-top: none;
                        }
                    }
                }
                .content-item {
                    min-height: 90rpx;
                    border-top: 1px solid #eee;
                    .content-title {
                        width: 180rpx;
                        @include fontStyle(#444);
                    }
                }
                .content-picture {
                    .content-title {
                        line-height: 90rpx;
                    }
                    .content-detail {
                        padding: 20rpx 0;
                    }
                }
                .content-link {
                    padding: 25rpx 0;
                    .content-detail {
                        width: 0;
                        text-align: right;
                        word-break: break-all;
                        @include fontStyle;
                    }
                }
            }
        }
        .form-hint {
            padding: 25rpx $space;
            @include fontStyle(#f00, 24rpx, 36rpx);
        }
    }
</style>
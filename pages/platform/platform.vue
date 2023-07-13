<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="我的平台账号" title-size="32" title-color="#333" z-index="99999" :border-bottom="false">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="platform-container">
            <view class="list">
                <view class="item" v-for="(item, index) in platform" :key="index">
                    <view class="item-top flex flex-column-center flex-row-between" @tap="['0', '1', '2'].includes(item.auditStatus) ? '' : toBinding(index, 'binding')">
                        <view class="item-title flex1 flex flex-column-center">
                            <image class="platform-icon" :src="item.platformIcon" mode="aspectFill"></image>
                            <text class="platform-text flex1">{{ item.platformName }}</text>
                        </view>
                        <view class="item-right">
                            <text v-if="item.auditStatus == '0'">账号链接审核中</text>
                            <text v-else-if="item.auditStatus == '1'">账号链接审核通过</text>
                            <text v-else-if="item.auditStatus == '2'">账号链接审核拒绝</text>
                            <u-icon name="arrow-right" class="icon" v-else></u-icon>
                        </view>
                    </view>
                    <view class="item-content" v-if="item.auditStatus == '0'">
                        <view class="item-link flex flex-row-between">
                            <view class="link-title">主页链接</view>
                            <view class="link-detail flex1">{{ item.bindingUrl }}</view>
                        </view>
                        <view class="item-picture flex flex-row-between">
                            <view class="picture-title">主页截图</view>
                            <view class="picture-detail flex1 flex flex-row-end">
                                <view class="picture-container">
                                    <u-image @tap="$common.previewImage(item.bindingImgList, 0)" :src="item.bindingImg" width="100%" height="100%" mode="aspectFill"></u-image>
                                </view>
                            </view>
                        </view>
                    </view>
                    <view class="item-content" v-else-if="item.auditStatus == '1'">
                        <view class="item-customer">
                            <view class="item-userInfo flex flex-column-center">
                                <view class="item-headImg">
                                    <u-image :src="item.headImg" shape="circle" width="100%" height="100%" mode="aspectFill"></u-image>
                                </view>
                                <view class="item-name flex1">{{ item.bloggerName }}</view>
                                <button class="item-change" @tap="toBinding(index, 'change')">换绑</button>
                            </view>
                            <view class="item-data flex">
                                <view class="item-number flex1">
                                    <view class="number-content">{{ item.fansNum }}</view>
                                    <view class="number-title">粉丝数</view>
                                </view>
                                <view class="item-number flex1">
                                    <view class="number-content">{{ item.likesNum }}</view>
                                    <view class="number-title">点赞数</view>
                                </view>
                                <view class="item-number flex1">
                                    <view class="number-content">{{ item.collectNum }}</view>
                                    <view class="number-title">收藏数</view>
                                </view>
                            </view>
                        </view>
                    </view>
                    <view class="item-content" v-else-if="item.auditStatus == '2'">
                        <view class="itme-hint flex flex-row-between">
                            <view class="hint-title">拒绝原因</view>
                            <view class="hint-detail flex1">{{ item.refusalCause }}</view>
                        </view>
                        <view class="item-button flex flex-row-end">
                            <button @tap="toBinding(index, 'binding')">重新绑定</button>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            platform: [
                {
                    platformId: '2',
                    platformName: '小红书',
                    platformIcon: '/static/images/platform/icon03.png',
                    ruleDataType: 'binding_red_book_help',
                    bindingUrl: '',
                    bindingImg: ''
                },
                {
                    platformId: '1',
                    platformName: '抖音',
                    platformIcon: '/static/images/platform/icon04.png',
                    ruleDataType: 'binding_douyin_help',
                    bindingUrl: '',
                    bindingImg: ''
                },
                {
                    platformId: '4',
                    platformName: '微博',
                    platformIcon: '/static/images/platform/icon05.png',
                    ruleDataType: 'binding_weibo_help',
                    bindingUrl: '',
                    bindingImg: ''
                },
                // {
                //     platformId: '5',
                //     platformName: '快手',
                //     platformIcon: '/static/images/platform/icon02.png',
                //     ruleDataType: 'binding_kuaishou_help',
                //     bindingUrl: '',
                //     bindingImg: ''
                // },
                // {
                //     platformId: '3',
                //     platformName: '淘宝',
                //     platformIcon: '/static/images/platform/icon07.png',
                //     ruleDataType: 'binding_taobao_help',
                //     bindingUrl: '',
                //     bindingImg: ''
                // },
                {
                    platformId: '7',
                    platformName: 'B站',
                    platformIcon: '/static/images/platform/icon06.png',
                    ruleDataType: 'binding_bilibili_help',
                    bindingUrl: '',
                    bindingImg: ''
                }
            ]
        }),
        onLoad() {
            uni.removeStorageSync('bindingSuccess');
            this.$common.getCustomer(this, data => {
				if (this.$common.isNotEmpty(data)) {
                    this.requestPlatform();
				}
			}, true);
        },
        onShow() {
            if (uni.getStorageSync('bindingSuccess')) {
                uni.removeStorageSync('bindingSuccess');
                this.requestPlatform();
            }
        },
        methods: {
            requestPlatform() {
                this.$u.post('/getBindingAccountList').then(res => {
                    if (this.$common.isNotEmpty(res.data)) {
                        for (let $item of this.platform) {
                            for (let item of res.data) {
                                if (item.bindingType == $item.platformId) {
                                    if (item.auditStatus == '1') {
                                        item.fansNum = this.disposeNumber(item.fansNum);
                                        item.likesNum = this.disposeNumber(item.likesNum);
                                        item.collectNum = this.disposeNumber(item.collectNum);
                                    } else if (item.auditStatus == '0') {
                                        item.bindingImgList = this.$common.pictureToArray(item.bindingImg);
                                    }
                                    Object.assign($item, item);
                                }
                            }
                        }
                    }
                });
            },
            toBinding(index, type) {
                let params = this.platform[index];
                if (params.platformId != '2' && params.auditStatus == '1') {
                    uni.showToast({
                        icon: 'none',
                        title: '目前只支持小红书账号换绑'
                    })
                    return false;
                }
                this.$u.route('/pages/platform/binding', {
                    platformId: params.platformId,
                    platformName: params.platformName,
                    platformIcon: params.platformIcon,
                    ruleDataType: params.ruleDataType,
                    bindingId: params.bindingId,
                    type: type
                });
            },
            disposeNumber(num) {
                if (this.$common.isNumber(num)) {
                    if (parseFloat(num) < 1) {
                        return parseFloat(parseFloat(num) * 10000).toFixed(0);
                    } else {
                        return parseFloat(parseFloat(num).toFixed(1)) + '万';
                    }
                } else {
                    return 0;
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .platform-container {
        padding: 30rpx $space 50rpx;
        .list {
            .item {
                padding: 0 $space;
                background: #fff;
                border-radius: 15rpx;
                &:nth-child(n+2) {
                    margin-top: 25rpx;
                }
                .item-top {
                    height: 100rpx;
                    .item-title {
                        width: 0;
                        padding-right: 30rpx;
                    }
                }
                .item-right {
                    .icon {
                        @include fontStyle(#ccc);
                    }
                    text {
                        @include fontStyle(#ccc, 24rpx);
                    }
                }
                .item-content {
                    padding-bottom: 10rpx;
                    .itme-hint,
                    .item-link,
                    .item-picture {
                        padding: 20rpx 0;
                        border-top: 1px solid #eee;
                        .hint-title,
                        .link-title,
                        .picture-title {
                            width: 180rpx;
                            @include fontStyle(#444);
                        }
                    }
                    .hint-detail,
                    .link-detail {
                        width: 0;
                        text-align: right;
                        word-break: break-all;
                        @include fontStyle;
                    }
                    .picture-container {
                        width: 160rpx;
                        height: 160rpx;
                        overflow: hidden;
                        border-radius: 10rpx;
                    }
                    .item-button {
                        padding: 10rpx 0 20rpx;
                        button {
                            height: 50rpx;
                            padding: 0 20rpx;
                            border-radius: 50rpx;
                            background: $gradientColor;
                            @include fontStyle(#fff, 24rpx, 50rpx);
                        }
                    }
                    .item-customer {
                        padding: 20rpx 0;
                        border-top: 1px solid #eee;
                        .item-headImg {
                            width: 100rpx;
                            height: 100rpx;
                        }
                        .item-name {
                            width: 0;
                            text-align: left;
                            margin-left: 20rpx;
                            word-break: break-all;
                            @include fontStyle;
                        }
                        .item-change {
                            height: 50rpx;
                            width: 120rpx;
                            background: $color;
                            margin-left: 30rpx;
                            border-radius: 50rpx;
                            @include fontStyle(#fff, 24rpx, 50rpx);
                        }
                        .item-data {
                            margin-top: 20rpx;
                            text-align: center;
                            .number-content {
                                font-weight: bold;
                                @include fontStyle($color, 32rpx);
                            }
                            .number-title {
                                @include fontStyle(#aaa, 24rpx);
                            }
                        }
                    }
                }
            }
        }
    }
</style>
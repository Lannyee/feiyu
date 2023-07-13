<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="摸一摸抽奖" title-size="32" title-color="#333" z-index="99999" :border-bottom="false">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <image class="picture" src="@/static/images/img06.png" mode="widthFix"></image>
        <view class="lottery-container">
            <view class="lottery-top">
                <image class="picture" src="@/static/images/img07.png" mode="widthFix"></image>
                <view class="lottery-title flex-center" v-if="isLoadOver && lotteryTitle.length > 0">
                    <u-notice-bar type="none" :list="lotteryTitle" color="#fff" volume-size="36" font-size="30"></u-notice-bar>
                </view>
            </view>
            <view :class="{'lottery-middle': true, 'active': lotteryIng}" v-if="isLoadOver">
                <image class="picture" src="@/static/images/img08.png" mode="widthFix"></image>
                <view class="lottery-button" @tap="drawLottery">
                    <image src="@/static/images/img12.png" mode="aspectFit"></image>
                </view>
            </view>
        </view>
        <view class="rule-container" v-if="isLoadOver && ruleContent">
            <view class="rule-title">活动规则</view>
            <view class="rule-content">
                <u-parse :html="ruleContent"></u-parse>
            </view>
        </view>

        <u-popup v-model="isShowLottery" mode="bottom" :mask-close-able="false">
            <view class="lottery-success-container" v-if="lotterySuccess">
                <image class="picture" :src="lotterySuccess.prizeType == '9' ? '/static/images/img10.png' : '/static/images/img09.png'" mode="widthFix"></image>
                <view class="lottery-picture flex-center">
                    <image class="picture" :src="lotterySuccess.imgPath" mode="aspectFit"></image>
                </view>
                <view class="lottery-content">{{ lotterySuccess.prizeName }}</view>
                <view class="lottery-button flex-center">
                    <button @tap="receiveAward(lotterySuccess.prizeType)"></button>
                </view>
            </view>
        </u-popup>
    </view>
</template>

<script>
    export default {
        data: () => ({
            isLoadOver: false,
            lotteryTitle: [],
            ruleContent: '',
            lotteryId: '',
            lotteryIng: false,
            isShowLottery: false,
            lotterySuccess: null,
            lotteryCard: {
				resultList: [],
				page: {
					pageNum: 1,
					pageCount: 0
				},
				load: {
					isLoadOver: false,
					loadStatus: 'loadmore'
				},
				requestParam: {
					pageSize: 99999,
                    lotteryStatus: '0'
				},
                refresher: {
                    isClear: true
                }
			}
        }),
        onLoad(data) {
            uni.removeStorageSync('lotteryCardSuccess');
            this.lotteryId = data.lotteryId;

            this.$common.getCustomer(this, data => {
                if (this.$common.isNotEmpty(data)) {
                    this.requestRule();
                    this.requestLotteryTitle();
                    this.requestLotteryCard();
                }
            }, true);

            setTimeout(() => {
                this.isLoadOver = true;
            }, 500)
        },
        methods: {
            requestRule() {
                this.$u.post('/getRuleContent', {
                    groupCode: 'rule',
                    dataType: 'lottery'
                }).then(res => {
                    if (this.$common.isNotEmpty(res.data)) {
                        this.ruleContent = res.data;
                    }
                });
            },
            requestLotteryTitle() {
                this.$u.post('/queryLotteryTitle').then(res => {
                    this.lotteryTitle.push(res.data.dataValue);
                });
            },
            requestLotteryCard() {
                this.lotteryCard.page = {
                    pageNum: 1,
					pageCount: 0
                }
                this.lotteryCard.load = {
                    isLoadOver: false,
					loadStatus: 'loadmore'
                }
				this.$common.requestResultRender(this, '/getLotteryList', this.lotteryCard, item => {
                    item.isUse = false;
                    if (item.lotteryId == this.lotteryId) {
                        item.isUse = true;
                    }
                    return item;
                });
			},
            drawLottery() {
                if (!this.lotteryIng && this.lotteryCard.load.isLoadOver) {
                    if (this.$common.isEmpty(this.lotteryId)) {
                        for (let item of this.lotteryCard.resultList) {
                            if (!item.isUse) {
                                this.lotteryId = item.lotteryId;
                                item.isUse = true;
                                break;
                            }
                        }
                        if (this.$common.isEmpty(this.lotteryId)) {
                            uni.showToast({
                                icon: 'none',
                                title: '您的抽奖券不足'
                            })
                            return false;
                        }
                    }
                    this.lottery();
                }
            },
            lottery() {
                this.lotteryIng = true;
                this.$u.post('/getGoodsBagPrize', {
                    lotteryId: this.lotteryId
                }).then(res => {
                    uni.setStorageSync('lotteryCardSuccess', true);
                    this.lotterySuccess = res.data;
                    this.lotteryId = '';
                    if (res.data.prizeType == '4') {
                        this.requestLotteryCard();
                    }
                    setTimeout(() => {
                        this.lotteryIng = false;
                        this.isShowLottery = true;
                    }, 2000)
                });
            },
            receiveAward(prizeType) {
                this.isShowLottery = false;
                if (prizeType != '9' && prizeType != '1') {
                    uni.showToast({
                        title: '领取成功'
                    });
                } else if (prizeType == '1') {
                    this.$common.getTemplate(this, 'lottery', () => {
                        uni.showToast({
                            title: '领取成功'
                        });
                    });
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";

    .page-container {
        height: 100vh;
        overflow-y: auto;
        background: #fc2f58;
        padding-bottom: 50rpx;
        position: relative;
        .picture {
            width: 100%;
        }
    }

    .lottery-container {
        position: absolute;
        top: 200rpx;
        left: 0;
        right: 0;
        margin: auto;
        .lottery-top {
            position: relative;
            .picture {
                width: 80%;
            }
            .lottery-title {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                width: 68%;
                height: 100rpx;
                margin: auto;
            }
        }
        .lottery-middle {
            position: relative;
            margin-top: 100rpx;
            &.active {
                animation: lotteryMove 1s infinite;
            }
            .picture {
                width: 80%;
            }
            .lottery-button {
                position: absolute;
                left: 0;
                right: 0;
                margin: auto;
                bottom: 120rpx;
                width: 180rpx;
                height: 180rpx;
                image {
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }

    .rule-container {
        padding: 0 $space;
        margin-top: -500rpx;
        .rule-title {
            position: relative;
            text-align: center;
            background: #fff;
            font-weight: bold;
            @include fontStyle($color, 28rpx, 80rpx);
            &::before,
            &::after {
                content: '';
                position: absolute;
                z-index: 5;
                bottom: -20rpx;
                width: 40rpx;
                height: 40rpx;
                border-radius: 50%;
                background: #fc2f58;
            }
            &::before {
                left: -20rpx;
            }
            &::after {
                right: -20rpx;
                background: #ff6046;
            }
        }
        .rule-content {
            border-top: 1px solid #eee;
            padding: 25rpx $space 30rpx;
            background: #fff;
            @include parseContent;
        }
    }

    @keyframes lotteryMove {
        0% {
            transform: rotate(0deg);
        }
        65% {
            transform: rotate(0deg);
        }
        70% {
            transform: rotate(6deg);
        }
        75% {
            transform: rotate(-6deg);
        }
        80% {
            transform: rotate(6deg);
        }
        85% {
            transform: rotate(-6deg);
        }
        90% {
            transform: rotate(6deg);
        }
        95% {
            transform: rotate(-6deg);
        }
        100% {
            transform: rotate(0deg);
        }
    }

    .lottery-success-container {
        background: transparent;
        position: relative;
        .lottery-picture {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            margin: auto;
            width: 400rpx;
            height: 210rpx;
            image {
                margin: 0;
            }
        }
        .lottery-content {
            position: absolute;
            bottom: 370rpx;
            left: 0;
            right: 0;
            margin: auto;
            text-align: center;
            font-weight: bold;
            @include fontStyle(#fff, 32rpx);
        }
        .lottery-button {
            position: absolute;
            bottom: 150rpx;
            left: 0;
            right: 0;
            margin: auto;
            button {
                opacity: 0;
                width: 350rpx;
                height: 100rpx;
                border-radius: 100rpx;
            }
        }
    }
</style>
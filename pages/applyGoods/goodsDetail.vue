<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="商品详情" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="goods-picture">
            <view class="swiper-container">
				<u-swiper :list="goodsDetail.imgCarouselList" height="750" mode="number" indicator-pos="bottomRight" interval="5000" border-radius="0" @click="previewImage"></u-swiper>
			</view>
            <view class="picture-title" v-if="goodsDetail.rewardStr">{{ goodsDetail.rewardStr }}</view>
        </view>

        <view class="goods-info u-skeleton">
            <view class="goods-title u-skeleton-fillet">{{ goodsDetail.goodsName }}</view>
            <view class="goods-middle flex flex-column-center flex-row-between">
                <view class="flex flex-column-center u-skeleton-fillet">
                    <view class="goods-price">
                        <text>￥{{ goodsDetail.currentPrice }}</text>
                    </view>
                    <view class="goods-commission">
                        佣金比例：<text>{{ goodsDetail.commission }}%</text>
                    </view>
                </view>
                <view class="flex flex-column-center u-skeleton-fillet">
                    <view class="goods-collect" @tap="changeCollect(goodsDetail.goodsId)">
                        <u-icon :name="goodsDetail.isCollect ? 'star-fill' : 'star'"></u-icon>
                    </view>
                    <view class="goods-like flex flex-column-center" @tap="changeLike(goodsDetail.goodsId)">
                        <u-icon :name="goodsDetail.isLikes ? 'thumb-up-fill' : 'thumb-up'"></u-icon>
                        <text>{{ goodsDetail.likesNum > 999 ? '999+' : goodsDetail.likesNum }}</text>
                    </view>
                </view>
            </view>
            <view class="goods-bottom flex flex-column-center u-skeleton-fillet">
                <view class="goods-number">
                    数量：<text>{{ goodsDetail.applyNum }}</text>份
                </view>
                <view class="goods-number">
                    申请人数：<text>{{ goodsDetail.appliedNum + goodsDetail.basisApplyNum }}</text>
                </view>
            </view>
            <view class="goods-terminate flex u-skeleton-fillet" v-if="goodsDetail.goodsStatus == '4'">
                <text>活动已结束，下次赶早</text>
            </view>
            <view class="goods-time flex flex-column-center u-skeleton-fillet" v-else>
                距结束：<text>{{ timeData.day }}</text>天<text>{{ timeData.hour }}</text>时<text>{{ timeData.minute }}</text>分<text>{{ timeData.second }}</text>秒
            </view>
        </view>

		<u-skeleton :loading="!isLoadOver" :animation="true"></u-skeleton>

        <view class="goods-module goods-require" v-if="isLoadOver">
            <view class="module-title flex-center">
                <icon></icon>
                <icon></icon>
                <text>申请要求</text>
                <icon></icon>
                <icon></icon>
            </view>
            <view class="module-content">
                <u-parse :html="goodsDetail.testRequire"></u-parse>
            </view>
        </view>

        <view class="goods-module goods-brand" v-if="brandDetail.brandId">
            <view class="module-title flex-center">
                <icon></icon>
                <icon></icon>
                <text>品牌介绍</text>
                <icon></icon>
                <icon></icon>
            </view>
            <view class="brand-info flex flex-column-center">
                <view class="brand-picture">
                    <u-image :src="brandDetail.brandLogo" width="100%" mode="widthFix"></u-image>
                </view>
                <view class="brand-name">{{ brandDetail.brandName }}</view>
            </view>
            <view class="module-content">
                <u-parse :html="brandDetail.introduce"></u-parse>
            </view>
        </view>

        <view class="goods-module goods-detail" v-if="isLoadOver">
            <view class="module-title flex-center">
                <icon></icon>
                <icon></icon>
                <text>商品详情</text>
                <icon></icon>
                <icon></icon>
            </view>
            <view class="module-content">
                <u-parse :html="goodsDetail.details" :lazy-load="true"></u-parse>
            </view>
        </view>

        <view class="goods-button" v-if="isLoadOver">
            <view class="flex">
                <view class="goods-share">
                    <button @tap="isShowShare = !isShowShare, isShowOffer = false">
                        <u-icon name="share"></u-icon>
                    </button>
                </view>
                <view class="goods-apply flex1">
                    <button disabled v-if="goodsDetail.goodsStatus == '4'">已结束</button>
                    <button disabled v-else-if="goodsDetail.goodsStatus == '5'">已申请</button>
                    <button @tap="applyGoods" v-else>立即申请</button>
                </view> 
            </view>
        </view>

        <u-popup v-model="isShowShare" mode="bottom" z-index="9998">
            <view class="share-container">
                <view class="share-list flex">
                    <button class="item flex1 flex-center flex-column" hover-class="active" open-type="share">
                        <view class="item-icon">
                            <u-icon custom-prefix="custom-icon" name="fenxiang"></u-icon>
                        </view>
                        <view class="item-title">分享给好友</view>
                    </button>
                    <button class="item flex1 flex-center flex-column" hover-class="active" @tap="toGoodsShare">
                        <view class="item-icon">
                            <u-icon custom-prefix="custom-icon" name="erweima1"></u-icon>
                        </view>
                        <view class="item-title">生成分享码</view>
                    </button>
                    <button class="item flex1 flex-center flex-column" hover-class="active" @tap="getGoodsDetailLink">
                        <view class="item-icon">
                            <u-icon custom-prefix="custom-icon" name="lianjie"></u-icon>
                        </view>
                        <view class="item-title">复制链接</view>
                    </button>
                </view>
            </view>
        </u-popup>

        <u-popup v-model="isShowOffer" mode="center" negative-top="100" border-radius="30">
            <view class="offer-container">
                <view class="offer-picture">
                    <u-image src="/static/images/img03.png" width="100%" mode="widthFix"></u-image>
                </view>
                <view class="offer-title">报价金额</view>
                <view class="offer-input">
                    <view class="input-icon">
                        <u-icon name="rmb"></u-icon>
                    </view>
                    <view :class="{'input-content': true, 'focus': focusStyle}">
                        <u-input v-model="rewardMoney" @focus="focusStyle = true" @blur="focusStyle = false" @confirm="confirmOffer" type="number" :clearable="false" input-align="center" placeholder="请输入报价金额" />
                    </view>
                </view>
                <view class="offer-button">
                    <button @tap="confirmOffer">确定</button>
                </view>
            </view>
        </u-popup>

        <view class="goTop" v-if="scrollTop > 400" @tap="goTop">
			<u-icon name="arrow-up"></u-icon>
		</view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            goodsId: '',
            goodsSource: '',
            brandId: '',
            goodsDetail: {},
            brandDetail: {},
            timeData: {
                day: '00',
                hour: '00',
                minute: '00',
                second: '00'
            },
            isLoadOver: false,
            isShowShare: false,
            isShowOffer: false,
            focusStyle: false,
            rewardMoney: null,
            scrollTop: 0
        }),
        onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
        onLoad(data) {
            if (this.$common.isNotEmpty(data.scene)) {
                this.requestScene(data.scene, data => {
                    this.getGoodsAndBrand(data);
                });
            } else {
                this.getGoodsAndBrand(data);
            }
        },
        onShow() {
            let changeGoods = uni.getStorageSync('changeGoods');
            if (this.$common.isNotEmpty(changeGoods)) {
                for (let item of changeGoods) {
                    if (item.goodsId == this.goodsId) {
                        this.goodsDetail.goodsStatus = item.goodsStatus;
                        break;
                    }
                }
            }
        },
        methods: {
            goTop() {
				this.scrollTop = 0;
                uni.pageScrollTo({
                    scrollTop: 0,
                    duration: 0
                })
			},
            previewImage(index) {
                this.$common.previewImage(this.goodsDetail.imgCarouselList, index, false);
            },
            changeCollect(goodsId) {
                this.checkLogin(() => {
                    this.goodsDetail.isCollect = !this.goodsDetail.isCollect;
                    this.$u.post('/addOrDelCollect', {
                        goodsId
                    }).then(res => {
                        if (this.goodsDetail.isCollect) {
                            uni.removeStorageSync('reloadCollect');
                            uni.showToast({
                                icon: 'none',
                                title: '收藏成功'
                            })
                        } else {
                            uni.setStorageSync('reloadCollect', true);
                            uni.showToast({
                                icon: 'none',
                                title: '已取消收藏'
                            })
                        }
                    });
                })
            },
            changeLike(goodsId) {
                this.checkLogin(() => {
                    this.goodsDetail.isLikes = !this.goodsDetail.isLikes;
                    this.$u.post('/addOrDelLikes', {
                        goodsId
                    }).then(res => {
                        if (this.goodsDetail.isLikes) {
                            this.goodsDetail.likesNum++;
                            uni.showToast({
                                icon: 'none',
                                title: '点赞成功'
                            })
                        } else {
                            this.goodsDetail.likesNum--;
                            uni.showToast({
                                icon: 'none',
                                title: '已取消点赞'
                            })
                        }
                    });
                })
            },
            countDown() {
                let timer = 0;
                let nowDate = (new Date()).getTime();
                let endDate = (new Date(this.goodsDetail.endTime)).getTime();
                let distanceDate = endDate - nowDate;
                clearInterval(timer);
                if (distanceDate > 0) {
                    setInterval(() => {
                        nowDate = (new Date()).getTime();
                        distanceDate = endDate - nowDate;
                        if (distanceDate > 0) {
                            this.timeData.day = this.addTimeFull(Math.floor(distanceDate / (24 * 60 * 60 * 1000)));
                            this.timeData.hour = this.addTimeFull(Math.floor((distanceDate % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)));
                            this.timeData.minute = this.addTimeFull(Math.floor((distanceDate % (24 * 60 * 60 * 1000) % (60 * 60 * 1000)) / (60 * 1000)));
                            this.timeData.second = this.addTimeFull(Math.floor((distanceDate % (24 * 60 * 60 * 1000) % (60 * 60 * 1000) % (60 * 1000)) / 1000));
                        } else {
                            clearInterval(timer);
                        }
                    }, 1000)
                }
            },
            addTimeFull(num) {
                if (num < 10) {
                    return '0' + num;
                }
                return num;
            },
            applyGoods() {
                this.checkLogin(() => {
                    if (this.goodsDetail.tryType == 3 || this.goodsDetail.tryType == 4) {
                        this.isShowOffer = true;
                        this.isShowShare = false;
                    } else {
                        this.toGoodsOrder(this.goodsDetail.rewardMoney || 0);
                    }
                })
            },
            confirmOffer() {
                if (this.$common.isNumber(this.rewardMoney)) {
                    this.rewardMoney = Math.abs(parseFloat(this.rewardMoney));
                    if (this.rewardMoney > 99999999) {
                        uni.showToast({
                            icon: 'none',
                            title: '报价金额过大'
                        })
                        return false;
                    }
                    this.isShowOffer = false;
                    this.toGoodsOrder(this.rewardMoney);
                } else {
                    this.rewardMoney = null;
                    uni.showToast({
                        icon: 'none',
                        title: '请输入报价金额'
                    })
                }
            },
            toGoodsOrder(rewardMoney) {
                this.$common.getTemplate(this, 'order', () => {
                    // goodsSource 商品来源(1: 试用商品, 2: 兑换商品, 3: 中奖商品)
                    this.$u.route('/pages/applyGoods/goodsOrder', {
                        goodsId: this.goodsDetail.goodsId,
                        goodsSource: 1,
                        rewardMoney,
                        tryType: this.goodsDetail.tryType
                    });
                })
            },
            requestGoodsDetail(goodsId, goodsSource) {
                this.$u.post('/getGoodsDetails', {
                    goodsId,
                    goodsSource
                }).then(res => {
                    this.isLoadOver = true;
                    this.goodsDetail = res.data;
                    this.countDown();
                });
            },
            requestBrandDetail(brandId) {
                this.$u.post('/getBrandDetails', {
                    brandId
                }).then(res => {
                    this.brandDetail = res.data;
                });
            },
            checkLogin(callBack) {
                let params = {
					goodsId: this.goodsDetail.goodsId,
					brandId: this.goodsDetail.brandId,
					goodsSource: 3
				}
				this.$common.checkLogin(this, '/pages/applyGoods/goodsDetail', params, () => {
                    callBack && callBack()
                });
            },
            onShareAppMessage() {
                let params = 'goodsId=' + this.goodsDetail.goodsId + '&brandId=' + this.goodsDetail.brandId + '&goodsSource=3';
                return {
                    title: this.goodsDetail.goodsName,
                    imageUrl: this.goodsDetail.imgThumbnail,
                    path: '/pages/applyGoods/goodsDetail?' + params
                }
            },
            toGoodsShare() {
                this.isShowShare = false;
                this.$u.route('/pages/applyGoods/goodsShare', {
                    goodsId: this.goodsDetail.goodsId,
					brandId: this.goodsDetail.brandId,
					goodsSource: 3
                });
            },
            getGoodsDetailLink() {
                this.isShowShare = false;
                let testRequire = this.goodsDetail.testRequire.replace(/<[^<>]+>/g, "").replace(/&nbsp;/gi, "");
                let copyContent = `飞鱼：\n【${this.goodsDetail.goodsName}】\n招募人数：${this.goodsDetail.applyNum}\n招募类型：${this.goodsDetail.rewardStr}\n申请要求：${testRequire}`;
                this.$u.post('/getSharePoster', {
                    goodsId: this.goodsDetail.goodsId,
                    goodsSource: 3,
                    page: 'pages/applyGoods/goodsDetail',
                    scene: JSON.stringify({
                        goodsId: this.goodsDetail.goodsId,
                        brandId: this.goodsDetail.brandId,
                        goodsSource: 3
                    })
                }).then(res => {
                    if (this.$common.isNotEmpty(res.data)) {
                        copyContent += `\n报名链接：${res.data}`;
                    }
                    uni.setClipboardData({
                        data: copyContent,
                        success: () => {
                            uni.showToast({
                                title: '复制成功'
                            })
                        }
                    });
                }, error => {
                    uni.setClipboardData({
                        data: copyContent,
                        success: () => {
                            uni.showToast({
                                title: '复制成功'
                            })
                        }
                    });
                });
            },
            requestScene(scene, callBack) {
                this.$u.post('/getRuleContent', {
                    dataType: scene,
                    groupCode: 'poster'
                }).then(res => {
                    if (this.$common.isNotEmpty(res.data)) {
                        callBack && callBack(JSON.parse(res.data));
                    }
                });
            },
            getGoodsAndBrand(data) {
                if (this.$common.isEmpty(data.goodsId)) {
                    uni.showModal({
                        title: '提示',
                        content: '商品分享海报二维码已失效',
                        showCancel: false,
                        success: res => {
                            this.$u.route({
                                type: 'reLaunch',
                                url: '/pages/home/home'
                            });
                        }
                    })
                    return false;
                }
                this.goodsId = data.goodsId;
                this.goodsSource = data.goodsSource;
                this.brandId = data.brandId;
                this.$common.getCustomer(this, () => {
                    this.requestGoodsDetail(this.goodsId, this.goodsSource);
                    this.requestBrandDetail(this.brandId);
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";

    .page-container {
        padding-bottom: 120rpx;
    }

    .goods-picture {
        position: relative;
        .picture-title {
            max-width: 80%;
            position: absolute;
            z-index: 5;
            bottom: 0;
            left: 0;
            background: $gradientColor;
            padding: 10rpx 20rpx;
            border-radius: 0 30rpx 0 0;
            @include fontStyle(#fff, 28rpx);
            @include oneText;
        }
    }

    .goods-info {
        background: #fff;
        padding: 25rpx $space 30rpx;
        .goods-title {
            font-weight: bold;
            @include fontStyle(#333, 32rpx, 48rpx);
        }
        .goods-middle {
            margin-top: 15rpx;
        }
        .goods-price {
            font-weight: bold;
            margin-right: 20rpx;
            @include fontStyle($color, 36rpx);
        }
        .goods-commission {
            @include fontStyle(#aaa, 24rpx);
        }
        .goods-collect,
        .goods-like {
            @include fontStyle($color, 48rpx, 48rpx);
            text {
                margin-left: 10rpx;
                font-weight: bold;
                position: relative;
                top: 5rpx;
                @include fontStyle($color, 28rpx);
            }
        }
        .goods-like {
            margin-left: 25rpx;
        }
        .goods-bottom {
            margin-top: 10rpx;
        }
        .goods-number {
            @include fontStyle(#aaa, 24rpx);
            text {
                color: $color;
                font-weight: bold;
            }
            &:not(:last-of-type) {
                margin-right: 20rpx;
            }
        }
        .goods-time {
            margin-top: 20rpx;
            @include fontStyle(#aaa, 24rpx);
            text {
                height: 40rpx;
                padding: 0 5rpx;
                min-width: 40rpx;
                text-align: center;
                margin-right: 5rpx;
                border-radius: 5rpx;
                @include fontStyle(#fff, 24rpx);
                @include backgroundGradientColor;
                &:not(:first-of-type) {
                    margin-left: 10rpx;
                }
            }
        }
        .goods-terminate {
            margin-top: 20rpx;
            text {
                padding: 15rpx 30rpx;
                display: inline-block;
                background: $disabledColor;
                @include fontStyle(#fff, 24rpx);
            }
        }
    }

    .goods-module {
        margin-top: 25rpx;
        background: #fff;
        padding: 30rpx $space;
        .module-title {
            font-weight: bold;
            @include fontStyle;
            icon {
                width: 10rpx;
                height: 10rpx;
                margin: 0 5rpx;
                background: $color;
                transform: rotateZ(45deg);
            }
            text {
                margin: 0 10rpx;
            }
        }
        .module-content {
            margin-top: 25rpx;
            @include parseContent;
        }
        &.goods-brand {
            .brand-info {
                margin-top: 25rpx;
                .brand-name {
                    @include fontStyle;
                    margin-left: 20rpx;
                }
                .brand-picture {
                    width: 200rpx;
                }
            }
        }
        &.goods-detail {
            padding: 30rpx 0;
        }
    }

    .goods-button {
        background: #fff;
        padding: 20rpx $space;
        animation: buttonMove .3s;
        @include pageButtonFixed;
        .goods-share {
            button {
                width: 80rpx;
                height: 80rpx;
                border-radius: 50%;
                @include backgroundGradientColor;
                @include fontStyle(#fff, 44rpx, 80rpx);
            }
        }
        .goods-apply {
            button {
                height: 80rpx;
                margin-left: 30rpx;
                border-radius: 80rpx;
                @include backgroundGradientColor;
                @include fontStyle(#fff, 32rpx, 80rpx);
                &[disabled] {
                    background: $disabledColor;
                }
            }
        }
    }
    @keyframes buttonMove {
        0% {
            opacity: 0;
            bottom: -120rpx;
        }
        100% {
            opacity: 1;
            bottom: 0;
        }
    }

    .share-container {
        background: #fff;
        padding-bottom: 120rpx;
        .item {
            height: 240rpx;
            text-align: center;
            &.active {
                background: #f9f9f9;
            }
            .item-icon {
                width: 100rpx;
                height: 100rpx;
                margin: 0 auto;
                border-radius: 50%;
                border: 1px solid $color;
                @include fontStyle($color, 56rpx, calc(100rpx - 2px));
            }
            .item-title {
                margin-top: 10rpx;
                font-weight: bold;
                @include fontStyle;
            }
        }
    }

    .goTop {
        bottom: 170rpx;
    }
</style>
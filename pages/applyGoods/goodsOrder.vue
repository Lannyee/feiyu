<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="确认订单" title-size="32" title-color="#333" z-index="99999" :border-bottom="false">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="order-module order-goods u-skeleton">
            <view class="module-title">商品信息</view>
            <view class="module-content flex flex-column-center">
                <view class="goods-picture u-skeleton-fillet">
                    <u-image :src="goodsOrder.imgThumbnail" width="100%" height="100%" mode="aspectFill"></u-image>
                </view>
                <view class="goods-info flex1">
                    <view class="goods-title u-skeleton-fillet">{{ goodsOrder.goodsName }}</view>
                    <view class="goods-price flex flex-column-center flex-row-between u-skeleton-fillet">
                        <view class="goods-number">价格：<text>￥{{ goodsOrder.currentPrice }}</text></view>
                        <view class="goods-amount">x1</view>
                    </view>
                    <view class="goods-reward flex flex-column-center flex-row-between u-skeleton-fillet">
                        <view class="goods-number">报价：<text>￥{{ rewardMoney > 99999999 ? '99999999+' : rewardMoney }}</text></view>
                        <view class="reward-change" v-if="tryType == '3' || tryType == '4'">
                            <button @tap="isShowOffer = !isShowOffer">修改报价</button>
                        </view>
                        <view class="reward-text" v-else>{{ goodsOrder.tryTypeContent }}</view>
                    </view>
                </view>
            </view>
        </view>

        <u-skeleton :loading="loading" :animation="true"></u-skeleton>

        <view class="order-module order-type">
            <view class="module-title flex flex-column-center flex-row-between">
                <text>选择悬赏类别</text>
            </view>
            <view class="module-content flex">
                <view :class="{'item': true, 'active': item.isSelect, 'disabled': !item.isShow}" v-for="(item, index) in manuscriptType" :key="item.value" @tap="changeManuscriptType(index)">{{ item.title }}</view>
            </view>
        </view>

        <view class="order-module order-address">
            <view class="module-title flex flex-column-center flex-row-between">
                <text>收货地址</text>
                <view>
                    <button @tap="getLocalAddress">一键获取地址</button>
                </view>
            </view>
            <view class="module-content">
                <view class="item flex flex-column-center">
                    <view class="item-title">收货人</view>
                    <view class="item-content flex1">
                        <u-input type="text" v-model="goodsOrder.trueName" placeholder="请输入真实姓名" height="90" input-align="right" />
                    </view>
                </view>
                <view class="item flex flex-column-center">
                    <view class="item-title">手机号</view>
                    <view class="item-content flex1">
                        <u-input type="text" v-model="goodsOrder.phone" placeholder="请输入手机号码" height="90" input-align="right" />
                    </view>
                </view>
                <view class="item flex flex-column-center">
                    <view class="item-title">所在地区</view>
                    <view class="item-content region-content flex1 flex flex-column-center flex flex-row-end">
                        <picker :class="{'region': true, 'flex1': true, 'disabled': !goodsOrder.provinceName}" mode="region" :value="[goodsOrder.provinceName, goodsOrder.cityName, goodsOrder.countyName]" @change="bindRegionChange">
                            <view class="picker">{{ goodsOrder.provinceName || '省' }} {{ goodsOrder.cityName || '市' }} {{ goodsOrder.countyName || '区' }}</view>
                        </picker>
                        <u-icon :class="{'icon': true, 'disabled': !goodsOrder.provinceName}" name="arrow-down"></u-icon>
                    </view>
                </view>
                <view class="item flex flex-column-center">
                    <view class="item-title">详细地址</view>
                    <view class="item-content flex1">
                        <u-input type="text" v-model="goodsOrder.address" placeholder="请输入街道门牌信息" height="90" input-align="right" />
                    </view>
                </view>
                <view class="item flex flex-column-center">
                    <view class="item-title">联系方式</view>
                    <view class="item-content flex1">
                        <u-input type="text" v-model="goodsOrder.weChatNo" placeholder="请输入正确的微信联系方式" height="90" input-align="right" />
                    </view>
                </view>
                <view class="item item-picture flex">
                    <view class="item-title">微信二维码</view>
                    <view class="item-content flex1 flex flex-row-end">
                        <view class="upload-picture" v-for="(item, index) in goodsOrder.customerImg" :key="index">
                            <u-image @tap="$common.previewImage(goodsOrder.customerImg, index)" :src="item.url" width="100%" height="100%" mode="aspectFill"></u-image>
                            <button @tap="$common.deletePicture(goodsOrder.customerImg, index)" class="picture-delete" hover-class="active" v-if="item.isChange"><u-icon name="close"></u-icon></button>
                            <button @tap="$common.reloadPicture(goodsOrder.customerImg, index)" class="picture-reload" v-if="!item.isSuccess && item.uploadStatus == 'error'">重新上传</button>
                        </view>
                        <view class="upload-button" v-if="goodsOrder.customerImg.length == 0">
                            <button @tap="$common.uploadPicture(goodsOrder.customerImg)" hover-class="active"><u-icon name="plus"></u-icon></button>
                        </view>
                    </view>
                </view>
                <view class="hint-text">填写并上传正确的“微信联系方式”和“微信二维码截图”可提高审核速度！</view>
            </view>
        </view>

        <view class="order-module order-platform">
            <view class="module-title flex flex-column-center flex-row-between">
                <view class="flex flex-column-center">
                    <image class="platform-icon" v-if="goodsOrder.platformIcon" :src="goodsOrder.platformIcon" mode="aspectFill"></image>
                    <text class="platform-text">{{ goodsOrder.platformName || '' }}账号绑定</text>
                </view>
                <view>
                    <button class="title-hint flex flex-column-center" hover-class="active" @tap="toRule('binding')">
                        <view>绑定帮助</view>
                        <u-icon class="icon" name="question-circle-fill"></u-icon>
                    </button>
                </view>
            </view>
            <view class="module-content">
                <view class="item flex flex-column-center">
                    <view class="item-title">主页链接</view>
                    <view class="item-content flex1">
                        <u-input type="text" :disabled="goodsOrder.isChangeBinding" v-model="goodsOrder.bindingUrl" placeholder="请输入个人主页链接" height="90" input-align="right" />
                    </view>
                </view>
                <view class="item item-picture flex">
                    <view class="item-title">主页截屏</view>
                    <view class="item-content flex1 flex flex-row-end">
                        <view class="upload-picture" v-for="(item, index) in goodsOrder.bindingImg" :key="index">
                            <u-image @tap="$common.previewImage(goodsOrder.bindingImg, index)" :src="item.url" width="100%" height="100%" mode="aspectFill"></u-image>
                            <button @tap="$common.deletePicture(goodsOrder.bindingImg, index)" class="picture-delete" hover-class="active" v-if="item.isChange"><u-icon name="close"></u-icon></button>
                            <button @tap="$common.reloadPicture(goodsOrder.bindingImg, index)" class="picture-reload" v-if="!item.isSuccess && item.uploadStatus == 'error'">重新上传</button>
                        </view>
                        <view class="upload-button" v-if="goodsOrder.bindingImg.length == 0">
                            <button @tap="$common.uploadPicture(goodsOrder.bindingImg)" hover-class="active"><u-icon name="plus"></u-icon></button>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <view class="order-module order-require">
            <view class="module-title flex flex-column-center flex-row-between">
                <text>申请要求</text>
            </view>
            <view class="module-content">
                <u-parse :html="goodsOrder.testRequire"></u-parse>
            </view>
        </view>

        <view class="order-protocol">
            <u-checkbox class="checkbox" v-model="isProtocol" icon-size="20" size="30" active-color="#f36e96"></u-checkbox>
            <text class="checkbox-label" @tap="isProtocol = !isProtocol">申请须知：</text>
            <text @tap="isProtocol = !isProtocol">请认真阅读试用商品详情页中的测评要求再进行申请，添加上客户服务微信可以增加选中合作概率。申请即默认同意</text>
            <text class="protocol-button" @tap="toRule('try')">《飞鱼试用规则》</text>
        </view>

        <view class="goods-button">
            <view class="flex">
                <button class="flex1" hover-class="active" @tap="$common.navbarGoBack(this)">取消</button>
                <button class="flex1" @tap="$u.throttle(addOrder, 500)">确定</button>
            </view>
        </view>

        <u-popup v-model="isShowOffer" mode="center" negative-top="100" border-radius="30" :mask-close-able="false">
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
    </view>
</template>

<script>
    export default {
        data: () => ({
            goodsOrder: {},
            manuscriptType: [
                {
                    value: '1',
                    title: '图文原创',
                    isShow: false,
                    isSelect: false
                },
                {
                    value: '2',
                    title: '视频原创',
                    isShow: false,
                    isSelect: false
                }
            ],
            loading: true,
            isProtocol: false,
            isShowOffer: false,
            focusStyle: false,
            goodsId: null,
            goodsSource: null,
            rewardMoney: null,
            tryType: null
        }),
        onLoad(data) {
            this.goodsId = data.goodsId;
            this.goodsSource = data.goodsSource;
            this.rewardMoney = data.rewardMoney;
            this.tryType = data.tryType;
            this.$common.getCustomer(this, data => {
                if (this.$common.isNotEmpty(data)) {
                    this.requestAddress(addressId => {
                        this.requestGoodsOrder(addressId, this.goodsId, this.goodsSource);
                    })
                }
			}, true)

            if (uni.getStorageSync('tryAgreement')) {
                this.isProtocol = true;
            }
        },
        methods: {
            changeManuscriptType(index) {
                for (let item of this.manuscriptType) {
                    item.isSelect = false;
                }
                this.manuscriptType[index].isSelect = true;
            },
            bindRegionChange(e) {
                this.goodsOrder.provinceName = e.detail.value[0];
                this.goodsOrder.cityName = e.detail.value[1];
                this.goodsOrder.countyName = e.detail.value[2];
                this.goodsOrder.provinceNum = e.detail.code[0];
                this.goodsOrder.cityNum = e.detail.code[1];
                this.goodsOrder.countyNum = e.detail.code[2];
            },
            getLocalAddress() {
                uni.authorize({
                    scope: 'scope.address',
                    success: res => {
                        uni.chooseAddress({
                            success: res => {
                                this.goodsOrder.trueName = res.userName;
                                this.goodsOrder.phone = res.telNumber;
                                this.goodsOrder.provinceName = res.provinceName;
                                this.goodsOrder.cityName = res.cityName;
                                this.goodsOrder.countyName = res.countyName;
                                this.goodsOrder.provinceNum = '110000';
                                this.goodsOrder.cityNum = '110100';
                                this.goodsOrder.countyNum = '110101';
                                this.goodsOrder.address = res.detailInfo;
                            }
                        })
                    },
                    fail: error => {
                        uni.showModal({
                            title: '提示',
                            content: '小程序需要访问您的地址信息，是否重新授权？',
                            success: res => {
                                if (res.confirm) {
                                    uni.openSetting();
                                }
                            }
                        })
                    }
                })
            },
            addOrder() {
                if (!this.goodsOrder.trueName || !this.goodsOrder.phone || !this.goodsOrder.provinceName || !this.goodsOrder.address) {
                    uni.showToast({
                        icon: 'none',
                        title: '请完善收货地址'
                    })
                    return false;
                }
                
                if (!this.$u.test.mobile(this.goodsOrder.phone)) {
                    uni.showToast({
                        icon: 'none',
                        title: '请填写正确的手机号'
                    })
                    return false;
                }

                if (!this.goodsOrder.weChatNo) {
                    uni.showToast({
                        icon: 'none',
                        title: '请填写正确的微信联系方式'
                    })
                    return false;
                }

                if (this.goodsOrder.customerImg.length == 0) {
                    uni.showToast({
                        icon: 'none',
                        title: '请上传微信二维码截图'
                    })
                    return false;
                }

                if (!this.$common.isPictureUpload(this.goodsOrder.customerImg, '微信二维码截图')) {
                    return false;
                }

                if (!this.goodsOrder.bindingUrl) {
                    uni.showToast({
                        icon: 'none',
                        title: '请填写主页链接'
                    })
                    return false;
                }

                if (!this.$u.test.url(this.goodsOrder.bindingUrl)) {
                    uni.showToast({
                        icon: 'none',
                        title: '请填写正确的主页链接'
                    })
                    return false;
                }

                if (this.goodsOrder.bindingImg.length == 0) {
                    uni.showToast({
                        icon: 'none',
                        title: '请上传主页截图'
                    })
                    return false;
                }

                if (!this.$common.isPictureUpload(this.goodsOrder.bindingImg, '主页截图')) {
                    return false;
                }

                if (!this.isProtocol) {
                    uni.showToast({
                        icon: 'none',
                        title: '请阅读并勾选申请须知'
                    })
                    return false;
                }

                let selectType = null;
                for (let item of this.manuscriptType) {
                    if (item.isSelect) {
                        selectType = item.value;
                        break;
                    }
                }

                this.$u.post('/addOrder', {
                    goodsId: this.goodsOrder.goodsId,
                    goodsSource: this.goodsSource,
                    rewardMoney: this.rewardMoney,
                    manuscriptType: selectType,

                    addressId: this.goodsOrder.addressId,
                    trueName: this.goodsOrder.trueName,
                    phone: this.goodsOrder.phone,
                    provinceName: this.goodsOrder.provinceName,
                    cityName: this.goodsOrder.cityName,
                    countyName: this.goodsOrder.countyName,
                    provinceNum: this.goodsOrder.provinceNum,
                    cityNum: this.goodsOrder.cityNum,
                    countyNum: this.goodsOrder.countyNum,
                    address: this.goodsOrder.address,
                    customerImg: this.$common.pictureToString(this.goodsOrder.customerImg),
                    wechatNo: this.goodsOrder.weChatNo,

                    bindingId: this.goodsOrder.bindingId,
                    bindingType: this.goodsOrder.bindingType,
                    bindingUrl: this.goodsOrder.bindingUrl,
                    bindingImg: this.$common.pictureToString(this.goodsOrder.bindingImg),
                }).then(res => {
                    uni.setStorageSync('tryAgreement', true);
                    this.$common.setChangeGoods(this.goodsOrder.goodsId, '5');
                    this.$common.getTemplate(this, 'apply', () => {
                        uni.showToast({
                            title: '申请成功'
                        });
                        setTimeout(() => {
                            this.$u.route({
                                type: 'redirect',
                                url: '/pages/apply/apply'
                            });
                        }, 200);
                    })
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
                } else {
                    this.rewardMoney = null;
                    uni.showToast({
                        icon: 'none',
                        title: '请输入报价金额'
                    })
                }
            },
            requestGoodsOrder(addressId, goodsId, goodsSource) {
                this.$u.post('/getConfirmOrderDetails', {
                    addressId,
                    goodsId,
                    goodsSource
                }).then(res => {
                    this.loading = false;
                    this.goodsOrder = res.data;
                    this.goodsOrder.tryTypeContent = this.$common.getTryType(this.tryType, 'content');
                    this.goodsOrder.customerImg = this.$common.pictureToArray(this.goodsOrder.customerImg);
                    if (this.$common.isNotEmpty(this.goodsOrder.bindingUrl)) {
                        this.goodsOrder.isChangeBinding = true;
                    } else {
                        this.goodsOrder.isChangeBinding = false;
                    }
                    this.goodsOrder.bindingImg = this.$common.pictureToArray(this.goodsOrder.bindingImg, false);
                    if (this.goodsOrder.manuscriptType.includes('1')) {
                        this.manuscriptType[0].isShow = true;
                        this.manuscriptType[0].isSelect = true;
                        if (this.goodsOrder.manuscriptType.includes('2')) {
                            this.manuscriptType[1].isShow = true;
                        }
                    } else {
                        if (this.goodsOrder.manuscriptType.includes('2')) {
                            this.manuscriptType[1].isShow = true;
                            this.manuscriptType[1].isSelect = true;
                        }
                    }
                    this.goodsOrder.platformName = this.$common.getPlatformName(this.goodsOrder.bindingType);
                    this.goodsOrder.platformIcon = this.$common.getPlatformLogo(this.goodsOrder.bindingType);
                });
            },
            requestAddress(callBack) {
                this.$u.post('/getAddressList').then(res => {
                    let addressId = '';
                    if (this.$common.isNotEmpty(res.data)) {
                        addressId = res.data[0].addressId;
                    }
                    callBack && callBack(addressId);
                })
            },
            toRule(dataType) {
                if (dataType == 'try') {
                    this.$u.route('/pages/rule/rule', {
                        dataType: 'try_out',
                        ruleTitle: '飞鱼试用规则'
                    });
                } else {
                    dataType = 'binding_help';
                    if (this.goodsOrder.bindingType == '2') {
                        dataType = 'binding_red_book_help';
                    } else if (this.goodsOrder.bindingType == '1') {
                        dataType = 'binding_douyin_help';
                    } else if (this.goodsOrder.bindingType == '4') {
                        dataType = 'binding_weibo_help';
                    } else if (this.goodsOrder.bindingType == '5') {
                        dataType = 'binding_kuaishou_help';
                    } else if (this.goodsOrder.bindingType == '3') {
                        dataType = 'binding_taobao_help';
                    } else if (this.goodsOrder.bindingType == '7') {
                        dataType = 'binding_bilibili_help';
                    }
                    this.$u.route('/pages/rule/rule', {
                        dataType: dataType,
                        ruleTitle: '绑定帮助'
                    });
                }
            },
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .page-container {
        padding: 30rpx $space 150rpx;
    }

    .order-module {
        background: #fff;
        border-radius: 30rpx;
        padding: 30rpx $space;
        &:not(:first-child) {
            margin-top: 25rpx;
        }
        .module-title {
            text {
                font-weight: bold;
                @include fontStyle;
            }
        }
        .module-content {
            margin-top: 20rpx;
        }
    }

    .order-goods {
        margin-top: 0 !important;
        .module-content {
            .goods-picture {
                width: 180rpx;
                height: 180rpx;
                overflow: hidden;
                margin-right: 25rpx;
                border-radius: 20rpx;
            }
            .goods-title {
                @include fontStyle;
                @include muchText(2, 40rpx);
            }
            .goods-price,
            .goods-reward {
                @include fontStyle(#333, 26rpx);
            }
            .goods-number {
                word-break: break-all;
                padding-right: 10rpx;
                text {
                    color: $color;
                    font-weight: bold;
                }
            }
            .goods-amount,
            .reward-text {
                @include fontStyle(#aaa, 24rpx);
            }
            .reward-change {
                button {
                    width: 120rpx;
                    height: 44rpx;
                    border-radius: 44rpx;
                    @include backgroundGradientColor;
                    @include fontStyle(#fff, 22rpx, 44rpx);
                }
            }
            .goods-price {
                margin-top: 10rpx;
            }
            .goods-reward {
                margin-top: 5rpx;
            }
        }
    }

    .order-type {
        .module-content {
            .item {
                height: 56rpx;
                padding: 0 25rpx;
                background: #eee;
                border-radius: 56rpx;
                @include fontStyle(#666, 24rpx, 56rpx);
                &.active {
                    color: #fff;
                    @include backgroundGradientColor;
                }
                &.disabled {
                    display: none;
                }
                &:not(:last-of-type) {
                    margin-right: 25rpx;
                }
            }
        }
    }

    .order-address,
    .order-platform {
        .module-content {
            .item {
                border-bottom: 1px solid #eee;
                .item-title {
                    width: 180rpx;
                    @include fontStyle(#444);
                }
                .item-content {
                    &.region-content {
                        position: relative;
                    }
                    .region {
                        z-index: 10;
                        position: relative;
                        text-align: right;
                        @include fontStyle(#303133, 28rpx);
                        @include muchText(1, 90rpx);
                        &.disabled {
                            color: #c0c4cc;
                        }
                        .picker {
                            padding-right: 40rpx;
                        }
                    }
                    .icon {
                        position: absolute;
                        margin: auto;
                        right: 0;
                        top: 0;
                        bottom: 0;
                        z-index: 5;
                        @include fontStyle(#666, 26rpx);
                        &.disabled {
                            color: #c0c4cc;
                        }
                    }
                }
                &.item-picture {
                    .item-title {
                        line-height: 90rpx;
                    }
                    .item-content {
                        padding: 20rpx 0;
                    }
                }

            }
        }
    }
    
    .order-address {
        .module-title {
            button {
                height: 44rpx;
                padding: 0 15rpx;
                border-radius: 44rpx;
                @include backgroundGradientColor;
                @include fontStyle(#fff, 22rpx, 44rpx);
            }
        }
        .module-content {
            .hint-text {
                margin-top: 20rpx;
                @include fontStyle(red, 24rpx, 36rpx);
            }
        }
    }

    .order-platform {
        .module-title {
            .title-hint {
                @include fontStyle(#aaa, 26rpx);
                .icon {
                    margin-left: 5rpx;
                    @include fontStyle($color, 28rpx);
                }
                &.active {
                    color: $color;
                }
            }
        }
        .module-content {
            .item {
                &:last-of-type {
                    border-bottom: none;
                }
            }
        }
    }

    .order-require {
        .module-content {
            @include parseContent;
        }
    }

    .order-protocol {
        padding: 0 10rpx;
        margin-top: 25rpx;
        @include fontStyle(#999, 24rpx, 36rpx);
        .checkbox {
            margin-right: 10rpx;
            position: relative;
            top: -1px;
        }
        .checkbox-label {
            color: $color;
        }
        .protocol-button {
            color: $color;
        }
    }

    .goods-button {
        background: #fff;
        padding: 20rpx $space;
        @include pageButtonFixed;
        button {
            height: 80rpx;
            border-radius: 80rpx;
            @include backgroundGradientColor;
            @include fontStyle(#fff, 32rpx, 80rpx);
            &:not(:last-of-type) {
                margin-right: 30rpx;
            }
            &:first-of-type {
                background: #fff;
                border: 1px solid #ddd;
                @include fontStyle(#aaa, 32rpx, calc(80rpx - 2px));
                &.active {
                    background: #f9f9f9;
                }
            }
        }
    }
</style>
<template>
    <view class="page-container flex flex-column">
        <u-navbar :is-back="false" title="我的试用" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="swiper-tab">
			<u-tabs-swiper ref="uTabs" :is-scroll="false" :list="tabList" :current="tabCurrent" height="90" active-color="#f36e96" :bold="false" bar-width="250" bar-height="4" @change="changeTab"></u-tabs-swiper>
        </view>
        <swiper ref="swiper" class="swiper-container flex1" :current="swiperCurrent" @transition="transition" @animationfinish="animationfinish">
            <swiper-item class="swiper-item" v-for="(swiperItem, swiperIndex) in apply" :key="swiperIndex">
                <scroll-view scroll-y :refresher-enabled="true" :refresher-triggered="swiperItem.refresher.triggered" class="scroll-view" @refresherrefresh="refresherSwiper(swiperIndex)" @scrolltolower="onreachBottom(swiperIndex)">
                    <view class="hint flex flex-row-center" v-if="swiperIndex == 2">
                        <text>温馨提示：</text>如有疑问，请您<button open-type="contact">联系客服</button>
                    </view>
                    <view class="list" v-if="swiperItem.resultList.length > 0">
                        <view :class="{'item': true, 'disabled': swiperIndex == 1}" v-for="(item, index) in swiperItem.resultList" :key="index">
                            <view class="item-order flex flex-column-center">
                                <view class="order-picture">
                                    <u-image :src="item.imgThumbnail" width="100%" height="100%" mode="aspectFill"></u-image>
                                </view>
                                <view class="order-info flex1">
                                    <view class="order-title">{{ item.goodsName }}</view>
                                    <view class="order-price flex flex-column-center flex-row-between">
                                        <view class="order-number">价格：<text>￥{{ item.price }}</text></view>
                                        <view class="order-amount">x1</view>
                                    </view>
                                    <view class="order-reward flex flex-column-center flex-row-between">
                                        <view class="order-number">报价：<text>￥{{ item.rewardMoney || 0 }}</text></view>
                                        <view class="order-text">{{ item.tryTypeContent }}</view>
                                    </view>
                                    <view class="order-time">申请时间：<text class="order-text">{{ item.createTime }}</text></view>
                                </view>
                            </view>
                            <view class="item-progress">
                                <view class="progress-title flex flex-column-center flex-row-between">
                                    <view class="title-left flex flex-column-center">
                                        <u-icon class="title-icon" name="clock-fill"></u-icon>
                                        <text class="title-text">申请进度</text>
                                    </view>
                                    <view class="title-right">
                                        <text class="title-content">{{ item.applyStatusTitle }}</text>
                                    </view>
                                </view>
                                <view class="progress-list">
                                    <scroll-view scroll-x>
                                        <u-steps :list="item.applyProcess" mode="number" :current="item.applyProcessCurrent" active-color="#f36e96" un-active-color="#bcbcbc"></u-steps>
                                    </scroll-view>
                                </view>
                            </view>
                            <view class="item-operate" v-if="item.applyButton.length > 0">
                                <view class="operate-button flex flex-row-end">
                                    <button hover-class="active" v-for="(buttonItem, buttonIndex) in item.applyButton" :key="buttonIndex" @tap="operateButton(item, buttonItem.type)">{{ buttonItem.title }}</button>
                                </view>
                            </view>
                            <view class="picture-disabled flex-center" v-if="swiperIndex == 1">
                                <image src="@/static/images/img02.png" mode="aspectFit"></image>
                            </view>
                        </view>
                    </view>

                    <view class="list-default" v-if="swiperItem.load.isLoadOver && swiperItem.resultList.length == 0">
                        <u-icon class="default-icon" name="zanwushuju" custom-prefix="custom-icon"></u-icon>
                        <view class="default-text">暂无数据</view>
                    </view>
                </scroll-view>
            </swiper-item>
        </swiper>

        <u-popup v-model="isShowOffer" mode="center" negative-top="100" border-radius="30">
            <view class="offer-container">
                <view class="offer-picture">
                    <u-image src="/static/images/img03.png" width="100%" mode="widthFix"></u-image>
                </view>
                <view class="offer-title">作品链接</view>
                <view class="offer-input">
                    <view class="input-icon">
                        <u-icon name="attach"></u-icon>
                    </view>
                    <view :class="{'input-content': true, 'focus': focusStyle}">
                        <u-input v-model="noteLink" @focus="focusStyle = true" @blur="focusStyle = false" @confirm="confirmOffer" type="text" :clearable="false" input-align="center" placeholder="请输入作品链接" />
                    </view>
                </view>
                <view class="offer-button">
                    <button @tap="confirmOffer">提交</button>
                </view>
            </view>
        </u-popup>
    </view>
</template>

<script>
    export default {
        data: () => ({
            tabList: [
                {
                    name: '已申请'
                },
                {
                    name: '已结束'
                },
                {
                    name: '申诉中'
                }
            ],
            tabCurrent: 0,
            swiperCurrent: 0,
            isInitCurrent: false,
            apply: [
                {
                    index: 0,
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
                        applyStatus: 'applied_html'
                    },
                    refresher: {
                        triggered: false,
                        isClear: true
                    }
                },
                {
                    index: 1,
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
                        applyStatus: 'finish_status'
                    },
                    refresher: {
                        triggered: false,
                        isClear: true
                    }
                },
                {
                    index: 2,
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
                        applyStatus: '6'
                    },
                    refresher: {
                        triggered: false,
                        isClear: true
                    }
                }
            ],
            isShowOffer: false,
            focusStyle: false,
            noteLink: null,
            noteLinkApplyId: null
        }),
        onLoad(data) {
            uni.removeStorageSync('submitSuccess');
            if (data.index > 0) {
                this.tabCurrent = data.index;
                this.swiperCurrent = data.index;
            }
            setTimeout(() => {
                this.isInitCurrent = true;
            }, 1000)
            this.$common.getCustomer(this, data => {
				if (this.$common.isNotEmpty(data)) {
                    this.requestApply(this.swiperCurrent);
				}
			}, true);
        },
        onShow() {
            if (uni.getStorageSync('submitSuccess')) {
                uni.removeStorageSync('submitSuccess');
                for (let item of this.apply) {
                    item.page = {
                        pageNum: 1,
                        pageCount: 0
                    };
                    item.load = {
                        isLoadOver: false,
                        loadStatus: 'loadmore'
                    };
                }
                this.requestApply(this.swiperCurrent);
            }
        },
        methods: {
            changeTab(index) {
                this.swiperCurrent = index;
            },
            transition(e) {
                let dx = e.detail.dx;
                if (this.isInitCurrent) {
                    this.$refs.uTabs.setDx(dx);
                }
			},
			animationfinish(e) {
				let current = e.detail.current;
				this.$refs.uTabs.setFinishCurrent(current);
				this.swiperCurrent = current;
				this.tabCurrent = current;
                if (!this.apply[current].load.isLoadOver) {
                    this.requestApply(current);
                }
			},
            onreachBottom(current) {
                this.requestApply(current);
            },
            refresherSwiper(current) {
                if (!this.apply[current].refresher.triggered) {
                    this.apply[current].refresher.triggered = true;
                    this.reloadRequest(current);
                    this.requestApply(current, () => {
                        setTimeout(() => {
                            this.apply[current].refresher.triggered = false;
                        }, 500);
                    });
                }
            },
            requestApply(current, callBack) {
                this.$common.requestResultRender(this, '/getTestList', this.apply[current], item => {
                    item.tryTypeContent = this.$common.getTryType(item.tryType, 'content');
                    let applyParam = {
                        applyStatus: item.applyStatus,
                        tryType: item.tryType,
                        noteFeedback: item.noteFeedback,
                        finishStatus: item.finishStatus
                    }
                    item.applyStatusTitle = this.getApplyStatus(applyParam);
                    item.applyProcess = this.getApplyProcess(applyParam);
                    item.applyProcessCurrent = this.getApplyProcessCurrent(applyParam);
                    item.applyButton = this.getApplyButton(applyParam);
                    return item;
                }, callBack && callBack());
            },
            confirmOffer() {
                if (!this.noteLink) {
                    uni.showToast({
                        icon: 'none',
                        title: '请输入作品链接'
                    })
                    return false;
                }
                if (!this.$u.test.url(this.noteLink)) {
                    this.noteLink = null;
                    uni.showToast({
                        icon: 'none',
                        title: '请输入正确的作品链接'
                    })
                    return false;
                }
                uni.showModal({
                    title: '提示',
                    content: '确定要提交链接吗？',
                    success: res => {
                        if (res.confirm) {
                            this.$u.post('/submissionUrlPath', {
                                applyId: this.noteLinkApplyId,
                                urlPath: this.noteLink
                            }).then(res => {
                                this.isShowOffer = false;
                                this.noteLink = null;
                                this.noteLinkApplyId = null;
                                for (let item of this.apply) {
                                    item.page = {
                                        pageNum: 1,
                                        pageCount: 0
                                    };
                                    item.load = {
                                        isLoadOver: false,
                                        loadStatus: 'loadmore'
                                    };
                                }
                                this.requestApply(this.swiperCurrent);
                                this.$common.getTemplate(this, 'noteLink', () => {
                                    uni.showToast({
                                        title: '提交成功'
                                    });
                                });
                            });
                        }
                    }
                })
            },
            operateButton(apply, type) {
                if (apply.applyStatus == '0') {
                    if (type == 'apply') {
                        this.cancelApply(apply.goodsId, apply.applyId, apply.orderId);
                    } else if (type == 'address') {
                        this.toAddress(apply.orderId);
                    }
                } else if (apply.applyStatus == '1') {
                    if (type == 'apply') {
                        this.toAuction(apply.applyId);
                    } else if (type == 'address') {
                        this.toAddress(apply.orderId);
                    }
                } else if (apply.applyStatus == '2') {
                    if (type == 'apply') {
                        this.confirmDelivery(apply.orderId);
                    } else if (type == 'logistics') {
                        this.toLogistics(apply.orderId);
                    }
                } else if (apply.applyStatus == '3') {
                    if (type == 'apply') {
                        this.toManuscript(apply.applyId, apply.manuscriptType, apply.goodsId);
                    }
                } else if (apply.applyStatus == '4') {
                    if (type == 'apply') {
                        this.toManuscriptView(apply.applyId, apply.manuscriptType);
                    }
                } else if (apply.applyStatus == '5') {
                    if (type == 'apply') {
                        this.openNoteLink(apply.applyId);
                    }
                } else if (apply.applyStatus == '8') {
                    if (type == 'apply') {
                        this.launchAppeal(apply.applyId);
                    }
                } else if (apply.applyStatus == '9') {
                    if (type == 'apply') {
                        this.toManuscript(apply.applyId, apply.manuscriptType, apply.goodsId);
                    }
                } else if (apply.applyStatus == '10') {
                    if (type == 'apply') {
                        this.toManuscript(apply.applyId, apply.manuscriptType, apply.goodsId);
                    }
                } else if (apply.applyStatus == '12') {
                    if (type == 'apply') {
                        this.toAuxiliary(apply.applyId);
                    }
                } else if (apply.applyStatus == '13') {
                    if (type == 'apply') {
                        this.openNoteLink(apply.applyId);
                    }
                } else if (apply.applyStatus == '16') {
                    if (type == 'apply') {
                        this.toAuxiliaryView(apply.applyId);
                    }
                } else if (apply.applyStatus == '18') {
                    if (type == 'apply') {
                        this.toAuxiliary(apply.applyId);
                    }
                } else if (apply.applyStatus == '19') {
                    if (type == 'apply') {
                        this.toAuctionView(apply.applyId);
                    }
                } else if (apply.applyStatus == '20') {
                    if (type == 'apply') {
                        this.toManuscript(apply.applyId, apply.manuscriptType, apply.goodsId);
                    }
                } else if (apply.applyStatus == '21') {
                    if (type == 'apply') {
                        this.toAuction(apply.applyId);
                    }
                } else if (apply.applyStatus == '24') {
                    if (type == 'apply') {
                        this.launchAppeal(apply.applyId);
                    }
                }
            },
            cancelApply(goodsId, applyId, applyOrderId) {
                uni.showModal({
                    title: '提示',
                    content: '确定要取消此商品的试用吗？',
                    success: res => {
                        if (res.confirm) {
                            this.$u.post('/cancelApplication', {
                                applyId,
                                applyOrderId
                            }).then(res => {
                                uni.showToast({
                                    title: res.msg
                                });
                                setTimeout(() => {
                                    this.apply[this.swiperCurrent].page.pageNum = 1;
                                    this.apply[this.swiperCurrent].load.loadStatus = 'loadmore';
                                    this.requestApply(this.swiperCurrent);
                                }, 200);

                                this.$common.setChangeGoods(goodsId, '2');
                            });
                        }
                    }
                })
            },
            confirmDelivery(orderId) {
                uni.showModal({
                    title: '提示',
                    content: '确定要收货吗？',
                    success: res => {
                        if (res.confirm) {
                            this.$u.post('/confirmReceiptByOrderId', {
                                orderId
                            }).then(res => {
                                uni.showToast({
                                    title: '收货成功'
                                });
                                setTimeout(() => {
                                    this.apply[this.swiperCurrent].page.pageNum = 1;
                                    this.apply[this.swiperCurrent].load.loadStatus = 'loadmore';
                                    this.requestApply(this.swiperCurrent);
                                }, 200);
                            });
                        }
                    }
                })
            },
            toAddress(orderId) {
                this.$u.route('/pages/apply/editAddress', {
                    orderId
                });
            },
            toAuction(applyId) {
                this.$u.route('/pages/apply/auction', {
                    applyId
                });
            },
            toAuctionView(applyId) {
                this.$u.route('/pages/apply/auctionView', {
                    applyId
                });
            },
            toManuscript(applyId, manuscriptType, goodsId) {
                this.$u.route('/pages/apply/manuscript', {
                    applyId,
                    manuscriptType,
                    goodsId,
                    goodsSource: '3'
                });
            },
            toManuscriptView(applyId, manuscriptType) {
                this.$u.route('/pages/apply/manuscriptView', {
                    applyId,
                    manuscriptType
                });
            },
            openNoteLink(applyId) {
                this.isShowOffer = true;
                this.noteLink = null;
                this.noteLinkApplyId = applyId;
            },
            toAuxiliary(applyId) {
                this.$u.route('/pages/apply/auxiliary', {
                    applyId
                });
            },
            toAuxiliaryView(applyId) {
                this.$u.route('/pages/apply/auxiliaryView', {
                    applyId
                });
            },
            toLogistics(orderId) {
                this.$u.route('/pages/logistics/logistics', {
                    orderId
                });
            },
            launchAppeal(applyId) {
                uni.showModal({
                    title: '提示',
                    content: '确定要发起申诉吗？',
                    success: res => {
                        if (res.confirm) {
                            this.$u.post('/addAppeal', {
                                applyId
                            }).then(res => {
                                uni.showToast({
                                    title: '发起成功'
                                });
                                for (let item of this.apply) {
                                    item.page = {
                                        pageNum: 1,
                                        pageCount: 0
                                    };
                                    item.load = {
                                        isLoadOver: false,
                                        loadStatus: 'loadmore'
                                    };
                                }
                                this.changeTab(2);
                                this.requestApply(this.swiperCurrent);
                            });
                        }
                    }
                })
            },
            reloadRequest(current) {
				this.apply[current].page = {
					pageNum: 1,
					pageCount: 0
				}
				this.apply[current].load = {
					isLoadOver: false,
					loadStatus: 'loadmore'
				}
			},
            getApplyStatus(applyParam) {
                if (applyParam.applyStatus == '0') {
                    return '申请审核中';
                } else if (applyParam.applyStatus == '1') {
                    if (applyParam.tryType == '4') {
                        return '申请审核通过，待提交拍单信息';
                    } else {
                        return '申请审核通过，待发货';
                    }
                } else if (applyParam.applyStatus == '2') {
                    return '已发货，待确认收货';
                } else if (applyParam.applyStatus == '3') {
                    return '已收货，待提交初稿';
                } else if (applyParam.applyStatus == '4') {
                    return '初稿审核中';
                } else if (applyParam.applyStatus == '5') {
                    return '初稿审核通过，待提交作品链接';
                } else if (applyParam.applyStatus == '6') {
                    return '申诉中';
                } else if (applyParam.applyStatus == '7') {
                    return '申请审核不通过';
                } else if (applyParam.applyStatus == '8') {
                    return '初稿提交超时';
                } else if (applyParam.applyStatus == '9') {
                    return '初稿审核未通过';
                } else if (applyParam.applyStatus == '10') {
                    return '申诉通过，待提交初稿';
                } else if (applyParam.applyStatus == '11') {
                    return '作品链接审核中';
                } else if (applyParam.applyStatus == '12') {
                    if (applyParam.noteFeedback == '1') {
                        return '作品链接审核通过，待提交辅助说明';
                    } else {
                        return '作品链接审核通过';
                    }
                } else if (applyParam.applyStatus == '13') {
                    return '作品链接审核不通过';
                } else if (applyParam.applyStatus == '14') {
                    return '申请取消';
                } else if (applyParam.applyStatus == '15') {
                    return '系统自动申请拒绝';
                } else if (applyParam.applyStatus == '16') {
                    return '辅助说明审核中';
                } else if (applyParam.applyStatus == '17') {
                    return '辅助说明审核通过';
                } else if (applyParam.applyStatus == '18') {
                    return '辅助说明审核不通过';
                } else if (applyParam.applyStatus == '19') {
                    return '拍单信息审核中';
                } else if (applyParam.applyStatus == '20') {
                    return '拍单信息审核通过，待提交初稿';
                } else if (applyParam.applyStatus == '21') {
                    return '拍单信息审核不通过';
                } else if (applyParam.applyStatus == '24') {
                    return '申诉拒绝';
                }
            },
            getApplyProcess(applyParam) {
                let applyProcess = [
                    { name: '提交\n申请' },
                    { name: '提交\n拍单' },
                    { name: '发货' },
                    { name: '提交\n初稿' },
                    { name: '提交\n链接' },
                    { name: '辅助\n说明' },
                    { name: '申请\n完成' }
                ];
                if (applyParam.tryType == '4') {
                    if (applyParam.noteFeedback == '1') {
                        applyProcess.splice(2, 1);
                        return applyProcess;
                    } else {
                        applyProcess.splice(5, 1);
                        applyProcess.splice(2, 1);
                        return applyProcess;
                    }
                } else {
                    if (applyParam.noteFeedback == '1') {
                        applyProcess.splice(1, 1);
                        return applyProcess;
                    } else {
                        applyProcess.splice(5, 1);
                        applyProcess.splice(1, 1);
                        return applyProcess;
                    }
                }
            },
            getApplyProcessCurrent(applyParam) {
                if (['0', '1', '7', '14', '15'].includes(applyParam.applyStatus)) {
                    return 0;
                } else if (['2', '3', '6', '8', '10', '19', '20', '21', '24'].includes(applyParam.applyStatus)) {
                    return 1;
                } else if (['4', '5', '9'].includes(applyParam.applyStatus)) {
                    return 2;
                } else if (['4', '11', '13'].includes(applyParam.applyStatus)) {
                    return 3;
                } else if (['12'].includes(applyParam.applyStatus)) {
                    if (applyParam.finishStatus == '1') {
                        return 4;
                    }
                    return 3;
                } else if (['16', '18'].includes(applyParam.applyStatus)) {
                    return 4;
                } else if (['17'].includes(applyParam.applyStatus)) {
                    if (applyParam.finishStatus == '1') {
                        return 5;
                    }
                    return 4;
                }
                return 0;
            },
            getApplyButton(applyParam) {
                if (applyParam.finishStatus == '1') {
                    return [];
                }
                if (applyParam.applyStatus == '0') {
                    if (applyParam.tryType == '4') {
                        return [
                            {
                                title: '取消试用',
                                type: 'apply'
                            }
                        ];
                    } else {
                        return [
                            {
                                title: '修改地址',
                                type: 'address'
                            },
                            {
                                title: '取消试用',
                                type: 'apply'
                            }
                        ];
                    }
                } else if (applyParam.applyStatus == '1') {
                    if (applyParam.tryType == '4') {
                        return [
                            {
                                title: '提交拍单信息',
                                type: 'apply'
                            }
                        ];
                    } else {
                        return [
                            {
                                title: '修改地址',
                                type: 'address'
                            }
                        ];
                    }
                } else if (applyParam.applyStatus == '2') {
                    return [
                        {
                            title: '查看物流',
                            type: 'logistics'
                        },
                        {
                            title: '确认收货',
                            type: 'apply'
                        }
                    ];
                } else if (applyParam.applyStatus == '3') {
                    return [
                        {
                            title: '提交初稿',
                            type: 'apply'
                        }
                    ];
                } else if (applyParam.applyStatus == '4') {
                    return [
                        {
                            title: '查看稿件',
                            type: 'apply'
                        }
                    ];
                } else if (applyParam.applyStatus == '5') {
                    return [
                        {
                            title: '提交链接',
                            type: 'apply'
                        }
                    ];
                } else if (applyParam.applyStatus == '8') {
                    return [
                        {
                            title: '发起申诉',
                            type: 'apply'
                        }
                    ];
                } else if (applyParam.applyStatus == '9') {
                    return [
                        {
                            title: '重新提交初稿',
                            type: 'apply'
                        }
                    ];
                } else if (applyParam.applyStatus == '10') {
                    return [
                        {
                            title: '提交初稿',
                            type: 'apply'
                        }
                    ];
                } else if (applyParam.applyStatus == '12') {
                    if (applyParam.noteFeedback == '1') {
                        return [
                            {
                                title: '提交辅助说明',
                                type: 'apply'
                            }
                        ];
                    } else {
                        return [];
                    }
                } else if (applyParam.applyStatus == '13') {
                    return [
                        {
                            title: '重新提交链接',
                            type: 'apply'
                        }
                    ];
                } else if (applyParam.applyStatus == '16') {
                    return [
                        {
                            title: '查看辅助说明',
                            type: 'apply'
                        }
                    ];
                } else if (applyParam.applyStatus == '18') {
                    return [
                        {
                            title: '重新提交辅助说明',
                            type: 'apply'
                        }
                    ];
                } else if (applyParam.applyStatus == '19') {
                    return [
                        {
                            title: '查看拍单信息',
                            type: 'apply'
                        }
                    ];
                } else if (applyParam.applyStatus == '20') {
                    return [
                        {
                            title: '提交初稿',
                            type: 'apply'
                        }
                    ];
                } else if (applyParam.applyStatus == '21') {
                    return [
                        {
                            title: '重新提交拍单信息',
                            type: 'apply'
                        }
                    ];
                } else if (applyParam.applyStatus == '24') {
                    return [
                        {
                            title: '重新发起申诉',
                            type: 'apply'
                        }
                    ];
                }
                return [];
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .page-container {
        height: 100vh;
    }

    .swiper-container {
        box-sizing: border-box;
        .swiper-item {
            box-sizing: border-box;
        }
        .scroll-view {
            height: 100%;
            box-sizing: border-box;
        }
        .hint {
            padding: 10rpx;
            background: rgba($color, .3);
            @include fontStyle(#333, 24rpx);
            text {
                color: $color;
            }
            button {
                font-weight: bold;
                @include fontStyle($color, 24rpx);
            }
        }
        .list {
            padding: 30rpx $space 50rpx;
            .item {
                position: relative;
                background: #fff;
                overflow: hidden;
                padding: 30rpx;
                &:nth-child(n+2) {
                    margin-top: 25rpx;
                }
                .item-order {
                    .order-picture {
                        width: 200rpx;
                        height: 200rpx;
                        overflow: hidden;
                        margin-right: 25rpx;
                        border-radius: 20rpx;
                    }
                    .order-title {
                        @include fontStyle(#333, 26rpx, 36rpx);
                        @include muchText(2, 36rpx);
                    }
                    .order-number {
                        word-break: break-all;
                        padding-right: 10rpx;
                        text {
                            color: $color;
                            font-weight: bold;
                        }
                    }
                    .order-amount,
                    .order-text {
                        color: #aaa;
                    }
                    .order-price,
                    .order-reward,
                    .order-time {
                        margin-top: 10rpx;
                        @include fontStyle(#333, 24rpx, 32rpx);
                    }
                }
                .item-progress {
                    margin-top: 30rpx;
                    .progress-title {
                        .title-icon {
                            margin-right: 5rpx;
                            @include fontStyle($color, 36rpx);
                        }
                        .title-text {
                            @include fontStyle(#333, 28rpx);
                        }
                        .title-content {
                            @include fontStyle($color, 24rpx);
                        }
                    }
                    .progress-list {
                        margin-top: 15rpx;
                        padding: 30rpx 10rpx;
                        background: $backgroundColor;
                    }
                }
                .item-operate {
                    margin-top: 30rpx;
                    .operate-button {
                        button {
                            height: 50rpx;
                            padding: 0 20rpx;
                            border-radius: 50rpx;
                            border: 1px solid $color;
                            @include fontStyle($color, 24rpx, calc(50rpx - 2px));
                            &.active {
                                color: #fff;
                                background: $color;
                            }
                            &:nth-child(n+2) {
                                margin-left: 25rpx;
                            }
                        }
                    }
                }
                .picture-disabled {
                    z-index: 10;
                    background: rgba(#000, .5);
                    @include positionCenter;
                    image {
                        width: 60%;
                        height: 60%;
                    }
                }
            }
        }
    }
</style>
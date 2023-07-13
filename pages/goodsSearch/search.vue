<template>
    <view class="page-container flex flex-column">
        <u-navbar :is-back="false" title="搜索" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="form-container flex flex-column-center">
            <view class="form-input flex1 flex flex-column-center">
                <u-icon custom-prefix="custom-icon" name="sousuo" class="icon"></u-icon>
                <u-input class="flex1" type="type" v-model="goodsName" placeholder="请输入商品名称" height="70" @confirm="confirmSearch" />
            </view>
            <button class="form-cancel" @tap="$common.navbarGoBack(this)">取消</button>
        </view>

        <view class="form-list flex1" v-if="historySearch.length > 0">
            <scroll-view scroll-y class="scroll-view">
                <view class="form-title flex flex-row-between flex-column-center">
                    <view class="title-text">最近搜索</view>
                    <view class="title-right">
                        <u-icon name="trash-fill" class="icon" @tap="clearHistory"></u-icon>
                    </view>
                </view>
                <view class="list flex flex-wrap">
                    <view class="item" v-for="(item, index) in historySearch" :key="index" @tap="toResult(item)">{{ item }}</view>
                </view>
            </scroll-view>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            goodsName: '',
            historySearch: []
        }),
        onShow() {
            if (uni.getStorageSync('historySearch')) {
                this.historySearch = uni.getStorageSync('historySearch');
            }
        },
        methods: {
            confirmSearch() {
                if (this.$common.isNotEmpty(this.goodsName)) {
                    let historySearch = uni.getStorageSync('historySearch');
                    if (this.$common.isNotEmpty(historySearch)) {
                        if (!historySearch.includes(this.goodsName)) {
                            historySearch.unshift(this.goodsName);
                        }
                    } else {
                        historySearch = [this.goodsName];
                    }
                    uni.setStorageSync('historySearch', historySearch);

                    this.$u.route('/pages/goodsSearch/result', {
                        goodsName: this.goodsName
                    });
                }
            },
            toResult(goodsName) {
                this.goodsName = goodsName;
                this.$u.route('/pages/goodsSearch/result', {
                    goodsName
                });
            },
            clearHistory() {
                uni.showModal({
                    title: '提示',
                    content: '确定要清空搜索历史吗？',
                    success: res => {
                        if (res.confirm) {
                            this.historySearch = [];
                            uni.removeStorageSync('historySearch');
                        }
                    }
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .page-container {
        height: 100vh;
        background: #fff;
    }

    .form-container {
        padding: 30rpx $space;
		.form-input {
			overflow: hidden;
			padding: 0 20rpx;
			position: relative;
			border-radius: 70rpx;
			background: #f2f2f2;
			.icon {
				margin-right: 15rpx;
				@include fontStyle(#aaa, 36rpx);
			}
		}
		.form-cancel {
			width: 70rpx;
			text-align: right;
            @include fontStyle(#666, 28rpx, 70rpx);
		}
	}

    .form-list {
        overflow: hidden;
        .scroll-view {
            height: 100%;
            box-sizing: border-box;
        }
        .form-title {
            padding: 20rpx $space 0;
            .title-text {
                @include fontStyle;
            }
            .title-right {
                .icon {
                    @include fontStyle(#999, 32rpx);
                }
            }
        }
        .list {
            padding: 5rpx $space 50rpx;
            .item {
                margin-right: 15rpx;
                margin-top: 15rpx;
                text-align: left;
                padding: 15rpx 30rpx;
                border-radius: 60rpx;
                background: #f2f2f2;
                @include fontStyle(#333, 24rpx, 36rpx);
            }
        }
    }
</style>
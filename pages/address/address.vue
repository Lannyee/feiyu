<template>
    <view class="page-container page-bottom">
        <u-navbar :is-back="false" title="我的地址" title-size="32" title-color="#333" z-index="99999" :border-bottom="false">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="address-container">
            <view class="list">
                <view class="item" v-for="(item, index) in address" :key="index" @tap="selectAddress(index)">
                    <view class="item-container flex flex-column-center">
                        <view class="item-left"><u-icon name="map-fill" class="icon"></u-icon></view>
                        <view class="item-center flex1">
                            <view class="flex flex-column-center flex-wrap">
                                <view class="item-default" v-if="item.isDefault == '1'">【默认地址】</view>
                                <view class="item-name">{{ item.trueName }}</view>
                                <view class="item-phone">{{ item.phone }}</view>
                            </view>
                            <view class="item-detail">{{ item.provinceName }} {{ item.cityName }} {{ item.countyName }} {{ item.addressDetails }}</view>
                        </view>
                    </view>
                    <view class="item-bottom flex flex-column-center flex-row-end">
                        <button class="flex-center" hover-class="active" @tap.stop="toEdit(item.addressId)"><u-icon name="edit-pen" class="icon"></u-icon><text>编辑</text></button>
                        <button class="flex-center" hover-class="active" @tap.stop="deleteAddress(item.addressId)"><u-icon name="trash" class="icon"></u-icon><text>删除</text></button>
                    </view>
                </view>
            </view>

            <view class="list-default" v-if="isLoadOver && address.length == 0">
                <u-icon class="default-icon" name="zanwushuju" custom-prefix="custom-icon"></u-icon>
                <view class="default-text">暂无数据</view>
            </view>

            <button class="page-button" @tap="toAdd">新建地址</button>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            address: [],
            isLoadOver: false,
            isSelectAddress: false
        }),
        onLoad() {
            if (uni.getStorageSync('isSelectAddress')) {
                uni.removeStorageSync('isSelectAddress');
                this.isSelectAddress = true;
            }
        },
        onShow() {
            this.$common.getCustomer(this, data => {
				if (this.$common.isNotEmpty(data)) {
                    this.requestAddress();
				}
			}, true);
        },
        methods: {
            requestAddress() {
                this.$u.post('/getAddressList').then(res => {
                    this.address = [];
                    this.isLoadOver = true;
                    for (let item of res.data) {
                        this.address.push(item);
                        let address = uni.getStorageSync('address');
                        if (address.addressId == item.addressId) {
                            uni.setStorageSync('address', item);
                        }
                    }
                })
            },
            deleteAddress(addressId) {
                if (this.address.length == 1) {
                    uni.showToast({
                        icon: 'none',
                        title: '请至少保留一个默认地址'
                    })
                    return false;
                }
                uni.showModal({
                    title: '提示',
                    content: '确定要删除该地址吗？',
                    success: res => {
                        if (res.confirm) {
                            this.$u.post('/deleteCustomerAddress', {
                                addressId
                            }).then(res => {
                                let address = uni.getStorageSync('address');
                                if (address.addressId == addressId) {
                                    uni.removeStorageSync('address');
                                }
                                uni.showToast({
                                    title: res.msg
                                });
                                this.requestAddress();
                            });
                        }
                    }
                })
            },
            toEdit(addressId) {
                this.$u.route('/pages/address/edit', {
                    addressId
                });
            },
            toAdd() {
                if (this.$common.isNotEmpty(this.address)) {
                    this.$u.route('/pages/address/add');
                } else {
                    this.$u.route('/pages/address/add', {
                        isDisabled: true
                    });
                }
            },
            selectAddress(index) {
                if (this.isSelectAddress) {
                    let address = this.address[index];
                    uni.setStorageSync('address', address);
                    this.$u.route({
                        type: 'back'
                    });
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .address-container {
        padding: 30rpx $space 0;
        .list {
            .item {
                padding: 25rpx;
                background: #fff;
                border-radius: 20rpx;
                &:nth-child(n+2) {
                    margin-top: 25rpx;
                }
                .item-left {
                    margin-right: 20rpx;
                    .icon {
                        @include fontStyle($color, 50rpx, 50rpx);
                    }
                }
                .item-center {
                    word-break: break-all;
                }
                .item-default,
                .item-name,
                .item-phone {
                    @include fontStyle;
                }
                .item-default {
                    text-indent: -.5em;
                    font-weight: bold;
                    color: $color;
                }
                .item-name {
                    margin-right: 15rpx;
                }
                .item-detail {
                    margin-top: 5rpx;
                    @include fontStyle(#aaa, 24rpx, 36rpx);
                }
                .item-right {
                    .icon {
                        @include fontStyle(#ccc);
                    }
                }
                .item-bottom {
                    margin-top: 20rpx;
                    button {
                        width: 120rpx;
                        height: 50rpx;
                        border-radius: 8rpx;
                        border: 1px solid $color;
                        &:nth-child(n+2) {
                            margin-left: 15rpx;
                        }
                        .icon {
                            @include fontStyle($color, 32rpx);
                        }
                        text {
                            margin-left: 5rpx;
                            @include fontStyle($color, 24rpx);
                        }
                        &.active {
                            background: $color;
                            .icon,
                            text {
                                color: #fff;
                            }
                        }
                    }
                }
            }
        }
    }
</style>
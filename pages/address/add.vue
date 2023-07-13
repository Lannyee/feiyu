<template>
    <view class="page-container page-bottom">
        <u-navbar :is-back="false" title="新建地址" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="address-form">
            <view class="list">
                <view class="item flex flex-column-center">
                    <view class="item-title">收货人</view>
                    <view class="item-content flex1">
                        <u-input type="text" v-model="address.trueName" placeholder="请输入真实姓名" height="90" input-align="right" />
                    </view>
                </view>
                <view class="item flex flex-column-center">
                    <view class="item-title">手机号</view>
                    <view class="item-content flex1">
                        <u-input type="text" v-model="address.phone" placeholder="请输入手机号码" height="90" input-align="right" />
                    </view>
                </view>
                <view class="item flex flex-column-center">
                    <view class="item-title">所在地区</view>
                    <view class="item-content region-content flex1 flex flex-column-center flex flex-row-end">
                        <picker :class="{'region': true, 'flex1': true, 'disabled': !address.provinceName}" mode="region" :value="[address.provinceName, address.cityName, address.countyName]" @change="bindRegionChange">
                            <view class="picker">{{ address.provinceName || '省' }} {{ address.cityName || '市' }} {{ address.countyName || '区' }}</view>
                        </picker>
                        <u-icon :class="{'icon': true, 'disabled': !address.provinceName}" name="arrow-down"></u-icon>
                    </view>
                </view>
                <view class="item flex flex-column-center">
                    <view class="item-title">详细地址</view>
                    <view class="item-content flex1">
                        <u-input type="text" v-model="address.address" placeholder="请输入街道门牌信息" height="90" input-align="right" />
                    </view>
                </view>
                <view class="item flex flex-column-center">
                    <view class="item-title">联系方式</view>
                    <view class="item-content flex1">
                        <u-input type="text" v-model="address.wechatNo" placeholder="请输入正确的微信联系方式" height="90" input-align="right" />
                    </view>
                </view>
                <view class="item item-picture flex">
                    <view class="item-title">微信二维码</view>
                    <view class="item-content flex1 flex flex-row-end">
                        <view class="upload-picture" v-for="(item, index) in address.customerImg" :key="index">
                            <u-image @tap="$common.previewImage(address.customerImg, index)" :src="item.url" width="100%" height="100%" mode="aspectFill"></u-image>
                            <button @tap="$common.deletePicture(address.customerImg, index)" class="picture-delete" hover-class="active" v-if="item.isChange"><u-icon name="close"></u-icon></button>
                            <button @tap="$common.reloadPicture(address.customerImg, index)" class="picture-reload" v-if="!item.isSuccess && item.uploadStatus == 'error'">重新上传</button>
                        </view>
                        <view class="upload-button" v-if="address.customerImg.length == 0">
                            <button @tap="$common.uploadPicture(address.customerImg)" hover-class="active"><u-icon name="plus"></u-icon></button>
                        </view>
                    </view>
                </view>
                <view class="item flex flex-column-center">
                    <view class="item-title">设置为默认地址</view>
                    <view class="item-content flex1 flex flex-row-end">
                        <u-switch v-model="address.isDefault" :disabled="address.isDisabled" size="40" active-color="#f36e96"></u-switch>
                    </view>
                </view>
            </view>

            <button class="page-button" @tap="$u.throttle(addAddress, 500)">确认</button>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            address: {
                addressId: '',
                trueName: '',
                phone: '',
                provinceName: '',
                cityName: '',
                countyName: '',
                provinceNum: '',
                cityNum: '',
                countyNum: '',
                address: '',
                customerImg: [],
                wechatNo: '',
                isDefault: true,
                isDisabled: false
            }
        }),
        onLoad(data) {
            if (this.$common.isNotEmpty(data.isDisabled)) {
                this.address.isDisabled = true;
            }
        },
        methods: {
            bindRegionChange(e) {
                this.address.provinceName = e.detail.value[0];
                this.address.cityName = e.detail.value[1];
                this.address.countyName = e.detail.value[2];
                this.address.provinceNum = e.detail.code[0];
                this.address.cityNum = e.detail.code[1];
                this.address.countyNum = e.detail.code[2];
            },
            addAddress() {
                if (!this.address.trueName || !this.address.phone || !this.address.provinceName || !this.address.address) {
                    uni.showToast({
                        icon: 'none',
                        title: '请完善收货地址'
                    })
                    return false;
                }

                if (!this.$u.test.mobile(this.address.phone)) {
                    uni.showToast({
                        icon: 'none',
                        title: '请填写正确的手机号'
                    })
                    return false;
                }

                if (!this.address.wechatNo) {
                    uni.showToast({
                        icon: 'none',
                        title: '请填写正确的微信联系方式'
                    })
                    return false;
                }

                if (this.address.customerImg.length == 0) {
                    uni.showToast({
                        icon: 'none',
                        title: '请上传微信二维码截图'
                    })
                    return false;
                }

                if (!this.$common.isPictureUpload(this.address.customerImg, '微信二维码截图')) {
                    return false;
                }
                
                this.$u.post('/addOrUpdateCustomerAddress', {
                    addressId: this.address.addressId,
                    trueName: this.address.trueName,
                    phone: this.address.phone,
                    provinceName: this.address.provinceName,
                    cityName: this.address.cityName,
                    countyName: this.address.countyName,
                    provinceNum: this.address.provinceNum,
                    cityNum: this.address.cityNum,
                    countyNum: this.address.countyNum,
                    addressDetails: this.address.address,
                    customerImg: this.$common.pictureToString(this.address.customerImg),
                    wechatNo: this.address.wechatNo,
                    isDefault: this.address.isDefault ? '1' : '0'
                }).then(res => {
                    uni.showToast({
                        title: res.msg
                    });
                    setTimeout(() => {
                        this.$u.route({
                            type: 'back'
                        });
                    }, 200);
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .address-form {
        .item {
            padding: 0 $space;
            min-height: 90rpx;
            background: #fff;
            &:nth-child(n+2) {
                border-top: 1px solid #eee;
            }
            .item-title {
                width: 200rpx;
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
</style>
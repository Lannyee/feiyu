<template>
    <view class="page-container page-bottom">
        <u-navbar :is-back="false" title="个人资料" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="personal-form">
            <view class="item item-picture flex flex-column-center">
                <view class="item-title">头像</view>
                <view class="item-content flex1 flex flex-row-end">
                    <view class="personal-headImg" v-for="(item, index) in userInfo.headImg" :key="index">
                        <u-image @tap="$common.uploadPicture(userInfo.headImg, 1, 'replace')" :src="item.url" shape="circle" width="100%" height="100%" mode="aspectFill"></u-image>
                        <button @tap="$common.reloadPicture(userInfo.headImg, index)" v-if="!item.isSuccess && item.uploadStatus == 'error'" class="picture-reload flex-center">
                            <text>重新\n上传</text>
                        </button>
                    </view>
                </view>
            </view>
            <view class="item flex flex-column-center">
                <view class="item-title">昵称</view>
                <view class="item-content flex1">
                    <u-input type="text" v-model="userInfo.nickName" placeholder="请输入昵称" height="90" input-align="right" />
                </view>
            </view>
            <view class="item item-picker flex flex-column-center">
                <view class="item-title">性别</view>
                <view class="item-content flex1 flex flex-row-end">
                    <picker @change="changeGender" :value="userInfo.sex" :range="genderList" class="flex1">
                        <view class="picker-content">{{ genderList[userInfo.sex] }}</view>
                    </picker>
                </view>
            </view>
            <view class="item item-picker flex flex-column-center">
                <view class="item-title">年龄区间</view>
                <view class="item-content flex1 flex flex-row-end">
                    <picker @change="changeAge" :value="userInfo.age" :range="ageList" class="flex1">
                        <view :class="{'picker-content': true, 'placeholder': userInfo.age == 0}">{{ ageList[userInfo.age] }}</view>
                    </picker>
                </view>
            </view>
            <view class="item item-picker flex flex-column-center">
                <view class="item-title">肤质选择</view>
                <view class="item-content flex1 flex flex-row-end">
                    <picker @change="changeSkinType" :value="userInfo.skinType" :range="skinTypeList" class="flex1">
                        <view :class="{'picker-content': true, 'placeholder': userInfo.skinType == 0}">{{ skinTypeList[userInfo.skinType] }}</view>
                    </picker>
                </view>
            </view>
            <view class="item flex flex-column-center">
                <view class="item-title">擅长领域</view>
                <view class="item-content flex1 flex flex-row-end">
                    <view @tap="isField = true" :class="{'picker-content': true, 'placeholder': !userInfo.field}">{{ userInfo.field || '请选择擅长领域' }}</view>
                </view>
            </view>

            <button class="page-button" @tap="$u.throttle(saveUserInfo, 500)">保存</button>
        </view>

        <u-popup v-model="isField" mode="top" @open="requestField(userInfo.field);" @close="confirmField">
            <view class="field-container" :style="{'padding-top': navbarHeight + 'px'}">
                <view class="field-list flex flex-wrap">
                    <view :class="{'item': true, 'active': item.isSelect}" @tap="changeField(index)" v-for="(item, index) in fieldList" :key="index">{{ item.value }}</view>
                </view>
            </view>
		</u-popup>
    </view>
</template>

<script>
    export default {
        data: () => ({
            userInfo: {},
            genderList: ['保密', '男', '女'],
            ageList: ['请选择年龄区间', '0-18', '18-30', '30-40', '40+'],
            skinTypeList: ['请选择肤质', '中性肤质', '干性肤质', '油性肤质', '混合性肤质', '敏感性肤质'],
            fieldList: [],
            isField: false,
            isRequest: true,
            navbarHeight: 0
        }),
        onLoad() {
            this.$common.getNavbarHeight(navbarHeight => {
				this.navbarHeight = navbarHeight;
			});

            this.$common.getCustomer(this, data => {
				if (this.$common.isNotEmpty(data)) {
					this.userInfo = data;
                    this.userInfo.headImg = this.$common.pictureToArray(this.userInfo.headImg);
                    this.userInfo.age = this.ageList.indexOf(this.userInfo.age);
                    this.userInfo.skinType = this.skinTypeList.indexOf(this.userInfo.skinType);

                    if (this.userInfo.age == -1) {
                        this.userInfo.age = 0;
                    }
                    if (this.userInfo.skinType == -1) {
                        this.userInfo.skinType = 0;
                    }
				} else {
                    this.userInfo = {};
				}
			}, true);
        },
        methods: {
            changeGender(e) {
                this.userInfo.sex = e.detail.value;
            },
            changeAge(e) {
                this.userInfo.age = e.detail.value;
            },
            changeSkinType(e) {
                this.userInfo.skinType = e.detail.value;
            },
            changeField(index) {
                let isSelect = this.fieldList[index].isSelect;
                this.fieldList[index].isSelect = !isSelect;
            },
            confirmField() {
                let selectedFieldList = [];
                for (let item of this.fieldList) {
                    if (item.isSelect) {
                        selectedFieldList.push(item.value);
                    }
                }
                this.userInfo.field = selectedFieldList.join('、');
                this.isField = false;
            },
            saveUserInfo() {
                if (!this.$common.isPictureUpload(this.userInfo.headImg, '头像')) {
                    return false;
                }

                if (!this.userInfo.nickName) {
                    uni.showToast({
                        icon: 'none',
                        title: '请填写昵称'
                    })
                    return false;
                }

                this.$u.post('/updateCustomerInfo', {
                    headImg: this.$common.pictureToString(this.userInfo.headImg),
                    nickName: this.userInfo.nickName,
                    sex: this.userInfo.sex,
                    age: this.userInfo.age > 0 ? this.ageList[this.userInfo.age] : '',
                    skinType: this.userInfo.skinType > 0 ? this.skinTypeList[this.userInfo.skinType] : '',
                    field: this.userInfo.field
                }).then(res => {
                    uni.showToast({
                        title: '修改成功'
                    });
                    setTimeout(() => {
                        this.$u.route({
                            type: 'back'
                        })
                    }, 200);
                });
            },
            requestField(field) {
                if (!this.isRequest) {
                    return false;
                }
                this.$u.post('/getRuleContent', {
                    dataType: 'good_field',
                    groupCode: 'sys'
                }).then(res => {
                    this.isRequest = false;
                    if (this.$common.isNotEmpty(res.data)) {
                        let fieldList = res.data.split('、');
                        let selectedFieldList = [];
                        if (this.$common.isNotEmpty(field)) {
                            selectedFieldList = field.split('、');
                        }
                        let index = 0;
                        for (let $item of fieldList) {
                            this.fieldList.push({
                                value: $item,
                                index: index,
                                isSelect: false
                            })
                            for (let item of selectedFieldList) {
                                if (item == $item) {
                                    this.fieldList[index].isSelect = true;
                                    break;
                                }
                            }
                            index++;
                        }
                    }
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .personal-form {
        .item {
            padding: 0 $space;
            min-height: 90rpx;
            background: #fff;
            &:nth-child(n+2) {
                border-top: 1px solid #eee;
            }
            &:nth-child(4) {
                margin-top: 20rpx;
                border-top: none;
            }
            .item-title {
                width: 200rpx;
                @include fontStyle(#444);
            }
            .item-content {
                width: 0;
                .personal-headImg {
                    width: 120rpx;
                    height: 120rpx;
                    position: relative;
                    .picture-reload {
                        @include positionCenter;
                        border-radius: 50%;
                        z-index: 5;
                        opacity: .75;
                        font-weight: bold;
                        background: red;
                        padding-left: 10rpx;
                        letter-spacing: 10rpx;
                        @include fontStyle(#fff, 28rpx);
                    }
                }
                .picker-content {
                    width: 100%;
                    text-align: right;
                    @include fontStyle(#303133);
                    @include muchText(1, 90rpx);
                    &.placeholder {
                        color: #c0c4cc;
                    }
                }
            }
            &.item-picture {
                padding: 20rpx $space;
            }
        }
    }

    .field-container {
        background: #fff;
        .field-list {
            padding: 40rpx;
            overflow-y: auto;
            max-height: 600rpx;
            .item {
                width: 22%;
                height: 64rpx;
                padding: 0 10rpx;
                background: #eee;
                text-align: center;
                border-radius: 64rpx;
                @include fontStyle(#555, 24rpx);
                @include muchText(1, 64rpx);

                &:not(:nth-child(4n-3)) {
                    margin-left: 25rpx;
                }
                &:nth-child(n+5) {
                    margin-top: 25rpx;
                }
                &.active {
                    color: #fff;
                    @include backgroundGradientColor;
                }
            }
        }
    }
</style>
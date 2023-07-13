<template>
    <view class="page-container">
        <u-navbar :is-back="false" :title="ruleTitle" title-size="32" title-color="#333" z-index="99999" :border-bottom="false">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="rule-container">
            <view class="rule-title">{{ ruleTitle }}</view>
            <view class="rule-content">
                <u-parse :html="ruleContent"></u-parse>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            ruleTitle: '规则说明',
            ruleContent: ''
        }),
        onLoad(data) {
            let groupCode = '';
            let dataType = '';
            if (this.$common.isNotEmpty(data.ruleTitle)) {
                this.ruleTitle = data.ruleTitle;
            }
            if (this.$common.isNotEmpty(data.groupCode)) {
                groupCode = data.groupCode;
            } else {
                groupCode = 'rule';
            }
            if (this.$common.isNotEmpty(data.dataType)) {
                dataType = data.dataType;
            } else {
                dataType = 'customer_agreement';
            }
            this.requestRule(groupCode, dataType);
        },
        methods: {
            requestRule(groupCode, dataType) {
                this.$u.post('/getRuleContent', {
                    groupCode,
                    dataType
                }).then(res => {
                    if (this.$common.isNotEmpty(res.data)) {
                        this.ruleContent = res.data;
                    }
                });
            },
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";

    .rule-container {
        padding: 30rpx $space 50rpx;
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
                background: $backgroundColor;
            }
            &::before {
                left: -20rpx;
            }
            &::after {
                right: -20rpx;
            }
        }
        .rule-content {
            border-top: 1px solid #eee;
            padding: 25rpx $space 30rpx;
            background: #fff;
            @include parseContent;
        }
    }
</style>
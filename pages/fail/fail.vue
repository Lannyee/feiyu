<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="系统错误" title-size="32" title-color="#333" z-index="99999"></u-navbar>
        <view class="fail-container">
            <view class="fail-icon">
                <u-icon custom-prefix="custom-icon" name="fuwuqicuowu" class="icon"></u-icon>
            </view>
            <view class="fail-content">系统发生了未知错误，正在努力修复中</view>
            <view class="fail-button flex-center">
                <button @tap="$u.route({url: '/pages/home/home', type: 'tab'})">回到首页</button>
                <button open-type="contact">联系客服</button>
            </view>
        </view>
    </view>
</template>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .fail-container {
        padding: 150rpx 100rpx;
        text-align: center;
        .fail-icon {
            .icon {
                @include fontStyle($color, 200rpx, 200rpx);
            }
        }
        .fail-content {
            margin-top: 40rpx;
            @include fontStyle;
        }
        .fail-button {
            margin-top: 40rpx;
            button {
                height: 60rpx;
                width: 180rpx;
                border-radius: 60rpx;
                background: $gradientColor;
                @include fontStyle(#fff, 24rpx, 60rpx);
                &:nth-child(n+2) {
                    margin-left: 30rpx;
                }
            }
        }
    }
</style>
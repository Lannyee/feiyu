<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="新手指南" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="guide-container">
            <u-image src="https://feiyudata.com/profile/wechat/images/xszy.jpg" width="100%" mode="widthFix"></u-image>
        </view>
    </view>
</template>
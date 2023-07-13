<template>
    <view class="page-container">
        <u-navbar :is-back="false" title="常见问题" title-size="32" title-color="#333" z-index="99999">
            <view class="navbar">
                <view class="navbar-crumbs flex flex-column-center">
                    <button class="flex-center" @tap="$common.navbarGoBack(this)"><u-icon class="icon" name="arrow-left"></u-icon></button>
                    <view class="split-line"></view>
                    <button class="flex-center" @tap="$u.route({url: '/pages/home/home', type: 'tab'})"><u-icon class="icon" name="home"></u-icon></button>
                </view>
            </view>
        </u-navbar>

        <view class="question-container">
            <u-collapse arrow-color="#aaa" hover-class="none" :item-style="itemStyle" :head-style="headStyle" :body-style="bodyStyle">
                <u-collapse-item :title="item.questions" v-for="(item, index) in questionList" :key="index">
                    <view class="item-content">{{ item.asked }}</view>
                </u-collapse-item>
            </u-collapse>

            <view class="list-default" v-if="isLoadOver && questionList.length == 0">
                <u-icon class="default-icon" name="zanwushuju" custom-prefix="custom-icon"></u-icon>
                <view class="default-text">暂无数据</view>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data: () => ({
            questionList: [],
            isLoadOver: false,
            itemStyle: {
                background: '#fff',
                borderBottom: '1px solid #eee'
			},
            headStyle: {
                padding: '25rpx 30rpx',
                fontSize: '28rpx',
                lineHeight: '40rpx',
                color: '#333'
            }
        }),
        onLoad() {
            this.requestQuestion();
        },
        methods: {
            requestQuestion() {
                this.$u.post('/getFaqList').then(res => {
                    if (this.$common.isNotEmpty(res.data)) {
                        this.questionList = res.data;
                    } else {
                        this.questionList = [];
                    }
                    if (!this.isLoadOver) {
                        this.isLoadOver = true;
                    }
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "@/public.scss";
    
    .question-container {
        padding: 0 0 50rpx;
        .item-content {
            @include parseContent;
            padding: 25rpx 30rpx;
            border-top: 1px solid #eee;
        }
    }
</style>
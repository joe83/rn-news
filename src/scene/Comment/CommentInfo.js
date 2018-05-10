import React, { PureComponent } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Header from '../../widget/Header'
import CommentModal from './CommentModal';
import platform from '../../common/platform';
import UltimateListView from '../../component/listview/ultimateListView';
import http from '../../common/http';
import CommentItem from './CommentItem';
export default class CommentInfo extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            comment: props.navigation.state.params.comment,
            news: {
                item_id: props.navigation.state.params.comment.item_id,
            },
            init: false,
            comment_ic: require('../../img/ic_commentbar_back.png'),
            share_ic: require('../../img/ic_commentbar_share.png'),
        }
        this.navigation = props.navigation;
    }

    onFetch = (page = 1, startFetch, abortFetch) => {
        let formData = {
            page: page,
            item_id: this.state.comment.item_id,
            comment_id: this.state.comment.comment_id
        };
        http.post("/v1/comment-list", formData).then(res => {
            if (res.code === 200) {
                this.setState({
                    init: true,
                });
                let listArr = [];
                res.data.list.map(item => {
                    listArr.push(item)
                });
                startFetch(listArr, res.data.count)
            } else {
                abortFetch()
            }

        }, err => {
            abortFetch()
        })
    };
    renderPaginationFetchingView = () => {
        return <ActivityIndicator style={{ marginTop: 20 }} />;
    };
    renderSeparatorView = () => {
        return (<View style={{ height: platform.borderH, backgroundColor: "#f7f7f7" }}>
            <View style={{
                borderBottomWidth: platform.borderH,
                borderBottomColor: "#f0f0f0",
                marginLeft: 54,
                marginRight: 15
            }} />
        </View>)
    };
    renderEmptyView = () => {
        return (
            <TouchableOpacity
                onPress={() => {
                    this.commentModal.open(this.state.news)
                }}
                activeOpacity={1}
                style={styles.empty_view}>
                <Image
                    style={{ width: 120, height: 120 }}
                    source={require("../../img/img_blank_comment.png")}
                />
                <Text style={{ fontWeight: "bold", fontSize: 16, color: "#444444" }}>等你来评论哦</Text>
                <Text style={{ fontSize: 13, color: "#999999", marginTop: 12 }}>听说第一个发评论的人长得最好看...</Text>
            </TouchableOpacity>
        );
    };
    renderItem = (item, index, separator) => {
        return <CommentItem
            item={item}
            navigation={this.navigation}
            style={{ backgroundColor: "#f7f7f7" }}
            show_replay={false}
            rePlay={(comment_id, name, parent_id) => {
                this.commentModal.open(this.state.news, { comment_id: comment_id, name: name, parent_id: parent_id })
            }}
        />
    }

    renderHeader = () => {
        return <CommentItem
            item={this.state.comment}
            navigation={this.navigation}
            style={{ backgroundColor: "#FFFFFF" }}
            show_replay={false}
            rePlay={(comment_id, name, parent_id) => {
                this.commentModal.open(this.state.news, { comment_id: comment_id, name: name, parent_id: parent_id })
            }}
        />
    }

    render() {
        return (
            <View style={styles.page}>
                <Header title="评论详情" back={() => { this.navigation.goBack() }} />
                <UltimateListView
                    refreshable={false}
                    style={{ flex: 1, backgroundColor: "#f7f7f7" }}
                    ref={ref => this.listView = ref}
                    item={this.renderItem}
                    header={this.renderHeader}
                    onFetch={this.onFetch}
                    keyExtractor={(item, index) => item.comment_id}
                    separator={this.renderSeparatorView}//分割线
                    paginationFetchingView={this.renderPaginationFetchingView}//初始化加载View
                    emptyView={this.renderEmptyView}
                />
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        onPress={() => { this.commentModal.open(this.state.news, { comment_id: this.state.comment.comment_id, name: this.state.comment.user.name, parent_id: 0 }) }}
                        style={styles.input_view}>
                        <Text style={{ color: "#999999", fontSize: 12 }}>我来说两句...</Text>
                    </TouchableOpacity>
                </View>
                <CommentModal
                    ref={ref => { this.commentModal = ref }}
                    goLogin={() => {
                        this.navigation.navigate("Login")
                    }}
                    okCallBack={() => {
                        this.commentModal.okClose()
                        this.listView.refresh()
                    }}
                />
            </View>
        );
    }
}
const comment_bar_h = 49;
const styles = StyleSheet.create({
    page: {
        flex: 1,
        flexDirection: "column"
    },
    bottomBar: {
        height: comment_bar_h,
        backgroundColor: "#FFFFFF",
        borderTopColor: "#dcdcdc",
        borderTopWidth: platform.borderH,
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 15,
        paddingRight: 15
    },
    comment_btn: {
        alignItems: "center", justifyContent: "center", flexDirection: "row", flexGrow: 1
    },
    input_view: {
        backgroundColor: "#efefef",
        height: 28,
        borderRadius: 19,
        flexDirection: "row",
        paddingLeft: 15,
        alignItems: "center",
        flexGrow: 4,
        marginRight: 15
    },
    empty_view: {
        height: platform.deviceHeight - 120,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    }
})
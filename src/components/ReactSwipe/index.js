import React, { Component, PropTypes } from 'react';
import Flipsnap from './flipsnap';

class ReactSwipes extends Component {
  static propTypes = {
    swipeOptions: PropTypes.shape({
      distance: PropTypes.number,
      // continuous: PropTypes.bool,
      swTouchstart: PropTypes.func,
      swTouchmove: PropTypes.func,
      swTouchend: PropTypes.func
    }),
    // style: PropTypes.shape({
    //   container: PropTypes.object,
    //   wrapper: PropTypes.object,
    //   child: PropTypes.object
    // }),
    // id: PropTypes.string,
    // className: PropTypes.string
  };

  static defaultProps = {
    swipeOptions: {},
    style: {

      wrapper: {
        // overflow: 'hidden',
        // position: 'relative',
      },

      child: {
        // float: 'left',
        // width: '100%',
        // position: 'relative',
        // transitionProperty: 'transform'
      }
    },
    className: ''
  };

  componentDidMount() {
    const { options, children } = this.props;
    let len = children.length;
    this.swipes = Flipsnap(this.refs.container, {
        distance: options.distance
    });

    // 各个阶段事件监听
    this.swipes.element.addEventListener('fstouchstart', function(ev) {
        options.swTouchstart && options.swTouchstart(ev);
    }, false);

    this.swipes.element.addEventListener('fstouchmove', function(ev) {
        options.swTouchmove && options.swTouchmove(ev);
    }, false);

    this.swipes.element.addEventListener('fstouchend', ev => {
        options.swTouchend && options.swTouchend(ev);
    }, false);

    options.getSwipes && options.getSwipes(this.swipes);
  }

  // 注销
  componentWillUnmount() {
    this.swipes.destroy();
  }

  refresh() {
    this.swipes.refresh();
  }
  _toNext() {
    this.swipes.toNext();
  }
  _toPrev() {
    this.swipes.toPrev();
  }
  render() {
    const { id, className, style, children } = this.props;
    // todo 计算 父级包裹元素的宽度
    return (

      <div style={style.wrapper} className={className} ref="container">

        {React.Children.map(children, (child) => {
          // return React.cloneElement(child, {style: style.child});
          return React.cloneElement(child);
        })}
      </div>


    );
  }
}

export default ReactSwipes;

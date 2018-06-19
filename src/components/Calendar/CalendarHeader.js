import React, { PropTypes } from 'react';
import toFragment from 'rc-util/lib/Children/mapSelf';

function goMonth(direction) {
  const next = this.props.value.clone();
  next.add(direction, 'months');
  this.props.onValueChange(next);
}

function goYear(direction) {
  const next = this.props.value.clone();
  next.add(direction, 'years');
  this.props.onValueChange(next);
}

const CalendarHeader = React.createClass({
  propTypes: {
    enablePrev: PropTypes.any,
    enableNext: PropTypes.any,
    prefixCls: PropTypes.string,
    showTimePicker: PropTypes.bool,
    twoCalendar:PropTypes.bool,
    locale: PropTypes.object,
    value: PropTypes.object,
    onValueChange: PropTypes.func,
  },

  getDefaultProps() {
    return {
      enableNext: 1,
      enablePrev: 1,
    };
  },

  getInitialState() {
    this.nextMonth = goMonth.bind(this, 1);
    this.previousMonth = goMonth.bind(this, -1);
    this.nextYear = goYear.bind(this, 1);
    this.previousYear = goYear.bind(this, -1);
    return {};
  },

  onSelect(value) {
    this.props.onValueChange(value);
  },

  monthYearElement(showTimePicker) {
    const props = this.props;
    const prefixCls = props.prefixCls;
    const locale = props.locale;
    const twoCalendar = props.twoCalendar
    const value = props.value;
    const monthBeforeYear = locale.monthBeforeYear;
    const selectClassName = `${prefixCls}-${monthBeforeYear ? 'my-select' : 'ym-select'}`;
    const nextvalue = this.props.value.clone();
    nextvalue.add(1, 'months');
    const year = (<a
      className={`${prefixCls}-year-select`}
      role="button"
      title={locale.yearSelect}
    >
      {value.format(locale.yearFormat)}
    </a>);
    const month = (<a
      className={`${prefixCls}-month-select`}
      role="button"
      title={locale.monthSelect}
    >
      {value.format(locale.monthFormat)}
    </a>);
    const month1 = (<a
      className={`${prefixCls}-month-select`}
      role="button"
      title={locale.monthSelect}
    >
      {nextvalue.format(locale.monthFormat)}
    </a>);
    let day;
    if (showTimePicker) {
      day = (<a
        className={`${prefixCls}-day-select`}
        role="button"
      >
        {value.format(locale.dayFormat)}
      </a>);
    }
    let my = [];
    let my1 = [];
    if (monthBeforeYear) {
      my = [month, day, year];
      my1 = [month1, day, year];
    } else {
      my = [year, month, day];
      my1 = [year, month1, day];
    }
    return (<span className={selectClassName}>
      <span>{toFragment(my)}</span>

    <span>{twoCalendar && toFragment(my1)}</span>
    </span>);
  },

  showIf(condition, el) {
    return condition ? el : null;
  },


  render() {
    const props = this.props;
    const { enableNext, enablePrev, prefixCls, locale, value, showTimePicker } = props;
    const state = this.state;
    let PanelClass = null;

    let panel;
    if (PanelClass) {
      panel = (<PanelClass
        locale={locale}
        defaultValue={value}
        rootPrefixCls={prefixCls}
        onSelect={this.onSelect}
      />);
    }
    return (<div className={`${prefixCls}-header`}>
      <div style={{ position: 'relative' }}>
        {this.showIf(enablePrev && !showTimePicker,
          <a
            className={`${prefixCls}-prev-year-btn`}
            role="button"
            onClick={this.previousYear}
          />)}
        {this.showIf(enablePrev && !showTimePicker,
          <a
            className={`${prefixCls}-prev-month-btn`}
            role="button"
            onClick={this.previousMonth}
          />)}
        {this.monthYearElement(showTimePicker)}
        {this.showIf(enableNext && !showTimePicker,
          <a
            className={`${prefixCls}-next-month-btn`}
            onClick={this.nextMonth}
          />)}
        {this.showIf(enableNext && !showTimePicker,
          <a
            className={`${prefixCls}-next-year-btn`}
            onClick={this.nextYear}
          />)}
      </div>
      {panel}
    </div>);
  },
});

export default CalendarHeader;

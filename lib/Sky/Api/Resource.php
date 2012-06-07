<?php

namespace Sky\Api;

abstract class Resource {

    /*
    abstract static $construct_params = array(
        'param1' => 'This is the description of param1.'
    );
    */

    /**
     * When you override __construct, make sure the record requested is allowed
     * to be accessed by the Identity making the api call, and set all the
     * public properties that are to be returned from a 'general' api call
     * @param array $params POST key/value pairs
     * @param Identity $identity the identity of the app/user making the api call.
     *        It cannot be null for REST API call, only a direct call from a developer
     */
    abstract function __construct($params, $identity = null);

    /**
     *  convenience method for setting a value for many properties
     *  @param array $arr array of key value pairs
     *      each key is a property of the resource object to set its value
     */
    protected function set($arr) {
        if (!is_array($arr)) return;
        foreach ($arr as $var => $val) {
            $this->$var = $val;
        }
    }

    /**
     *  convenience method to return useful date formats for a given date string
     *  @param string date
     *  @return array various date formats
     */
    protected function dateArray($timestr) {
        return $this->dateTimeArray($timestr, array('U', 'n-d-Y', 'l', 'F', 'n', 'd', 'S', 'Y'));
    }

    /**
     *  convenience method to return useful time formats for a given time string
     *  @param string time
     *  @return array various time formats
     */
    protected function timeArray($timestr) {
        $values = $this->dateTimeArray($timestr, array('U', 'g:ia', 'g', 'i', 'a'));
        if (is_array($values)) $values['formatted'] = str_replace(':00', '', $values['g:ia']);
        return $values;
    }

    /**
     * convenience method to return useful date/time formats for a given date/time string
     * @param string date and time
     * @param array formats, see php manual for date() formats
     * @return array various date/time formats
     */
    protected function dateTimeArray($timestr, $formats = null) {
        if (!$timestr) return null;
        $timestr = strtotime($timestr);
        if (!is_array($formats)) $formats = array(
            'U', 'n-d-Y g:ia', 'c', 'l', 'F', 'n', 'd', 'S', 'Y', 'g', 'i', 'a'
        );
        $data = array();
        array_walk($formats, function($format, $key, $timestr) use(&$data){
            $data[$format] = date($format, $timestr);
        }, $timestr);
        return $data;
    }

    /**
     * Shorthand for throwing an exception
     * @param string $message error message
     * @throws \Exception
     */
    protected function error($message) {
        throw new \Exception($message);
    }
}
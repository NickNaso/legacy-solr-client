/*******************************************************************************
 * Copyright (c) 2017 Nicola Del Gobbo
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the license at http://www.apache.org/licenses/LICENSE-2.0
 *
 * THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS
 * OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY
 * IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
 * MERCHANTABLITY OR NON-INFRINGEMENT.
 *
 * See the Apache Version 2.0 License for specific language governing
 * permissions and limitations under the License.
 *
 * Contributors - initial API implementation:
 * Nicola Del Gobbo <nicoladelgobbo@gmail.com>
 * Mauro Doganieri <mauro.doganieri@gmail.com>
 ******************************************************************************/

'use strict'

exports.dateISOify = dateISOify
exports.toISOString = toISOString

// ISOify `Date` objects (possibly in collections)
function dateISOify(obj) {
    if (obj instanceof Array) {
        for (var i = 0; i < obj.length; i++) {
            obj[i] = dateISOify(obj[i])
        }
    } else if (obj instanceof Object && !(obj instanceof Date)) {
        for (var key in obj) {
            if (obj[key] instanceof Date) obj[key] = toISOString(obj[key])
        }
    } else {
        if (obj instanceof Date) obj = toISOString(obj)
    }
    return obj
}

// ISOify a single `Date` object
// Sidesteps `Invalid Date` objects by returning `null` instead
function toISOString(date) {
    return (date && !isNaN(date.getTime())) ? date.toISOString() : null
}

// Expose `stringify()`
exports.stringify = stringify

// Serialize an object to a string. Optionally override the default separator 
// ('&') and assignment ('=') characters.
function stringify(obj, sep, eq, name) {
    sep = sep || '&'
    eq = eq || '='
    obj = (obj === null) ? undefined : obj
    switch (typeof obj) {
        case 'object':
            return Object.keys(obj).map(function (k) {
                if (Array.isArray(obj[k])) {
                    return obj[k].map(function (v) {
                        return stringifyPrimitive(k) +
                            eq +
                            stringifyPrimitive(v)
                    }).join(sep)
                } else {
                    return stringifyPrimitive(k) +
                        eq +
                        stringifyPrimitive(obj[k])
                }
            }).join(sep)
        default:
            if (!name) return ''
            return stringifyPrimitive(name) + eq +
                stringifyPrimitive(obj)
    }
}

// Stringify a primitive
function stringifyPrimitive(v) {
    switch (typeof v) {
        case 'string':
            return v
        case 'boolean':
            return v ? 'true' : 'false'
        case 'number':
            return isFinite(v) ? v : ''
        default:
            return ''
    }
}

// Expose `escapeSpecialChars`
exports.escapeSpecialChars = escapeSpecialChars

// Escape special characters that are part of the query syntax of Lucene
function escapeSpecialChars(s) {
    return s.replace(/([\+\-&\|!\(\)\{\}\[\]\^"~\*\?:\\\ ])/g, 
    function (match) {
        return '\\' + match
    })
}

// Expose `escapeAndEncode`
exports.escapeAndEncode = escapeAndEncode

// Escape with `escapeSpecialChars` and encode with `encodeURIComponent`
function escapeAndEncode(s) {
    return encodeURIComponent(escapeSpecialChars(s.toString()))
}
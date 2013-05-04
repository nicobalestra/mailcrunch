(ns mailcrunch.backend.list
  (:use [korma.core :only [update insert values set-fields defentity table select where]])
  (:require [mailcrunch.backend.db :as db]
            [clojure.pprint :as pp]))

(defentity ent-list
  (table :lists))

(defn count
  ([] (select (db/q-number-of ent-list)))
  ([the-query] (select
                (db/q-number-of  ent-list)
                (where the-query))))

(defn get-lists
  ([] (select ent-list))
  ([query] (select ent-list
                   (where query))))


(defn update-list [list]
  (update ent-list
             (set-fields list)
             (where {:id (list :id)})))

(defn- insert-list [list]
  (insert ent-list
             (values list)
             (where {:id (list :id)})))


(defn save-list [list]
        (pp/pprint list)
        (if (list :id)
                (update-list list)
                (insert-list list)))

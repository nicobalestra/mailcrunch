(ns mailcrunch.backend.list
  (:use [korma.core :only [delete update insert values set-fields defentity table select where]])
  (:require [mailcrunch.backend.db :as db]
            [clojure.pprint :as pp]
            [mailcrunch.backend.triggers :as triggers]))

(defentity ent-list
  (table :lists)
  (triggers/prepare-fns))

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

(defn delete-by-ids [ids]
  (delete ent-list
          (where (in :id ids))))

(defn save-list [list]
        (pp/pprint list)
        (if (list :id)
                (update-list list)
                (insert-list list)))

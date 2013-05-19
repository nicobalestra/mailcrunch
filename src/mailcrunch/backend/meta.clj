(ns mailcrunch.backend.meta
  (:use [korma.core :only [defentity table select where]])
  (:require [mailcrunch.backend.db :as db]))

(defentity ent-entities
  (table "mailcrunch_entities"))

(defn entities
  ([] (select ent-entities))
  ([query] (select ent-entities
                   (where query))))

(defn count
  ([] (select (db/q-number-of ent-entities)))
  ([query] (select (db/q-number-of ent-entities query))))

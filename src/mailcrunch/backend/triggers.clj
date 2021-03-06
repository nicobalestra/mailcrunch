(ns mailcrunch.backend.triggers
	(:require [mailcrunch.backend.db :as db]
	 					[korma.core :as kc]
						[clj-time.core :as time]
						[clj-time.coerce :as time-coerce])
	(:import [java.sql Timestamp]))

(defn is-insert 
	"Check to see whether the id is missing, is nil or is an empty string. In this
	case we consider an insert is going to be performed."
	[values]
	(let [id-val (:id values)]
		(or (and (:id (set (keys values)))
				     (nil? id-val))
 				(nil? id-val)
				(not (seq (str id-val))))))

(def insert-fns {
								 
                 :set-userdef-id (fn [entity]
                                    (fn [values]
																			(if (and 	(is-insert values) 
																								(nil? (:userdef_id values)))
																				(let [[{:keys [nextval]}] (db/new-userdef-seq-val entity)]
																					 (assoc values :userdef_id (str (:table entity) nextval)))
																				 values)))
								 :set-creation-date (fn [entity] 
																			(fn [values] 
																				(if (and (is-insert values)
																								 (nil? (:creation_date values)))
																					(let [now (-> (time/now)
																												(time/milli)
																												(Timestamp. ))
																								now (time-coerce/to-long (time/now))]
																					(assoc values :creation_date now)))
																				values))
                 :set-created-by (fn [entity] 
																	 (fn [values] 
																		 (do 
																			 (println "inserting with values " values)
																				values)))
								 
                 :remove-id (fn [entity] 
															(fn [values]
																 ;If the :id is in the values map but it's nil, remove it from
																 ;the map
																 (if (is-insert values)
																	 (dissoc values :id)
																	 values)))
                 })


(defmacro prepare-fns
  "For every insert make sure we add all the mandatory fields which can be 
	 autogenerated (i.e. userdef_id, creation_date, etc..)"
  [entity]
  `(-> ~entity ~@(for [[k v] (seq insert-fns)] 
          `(kc/prepare (~v ~entity)))))
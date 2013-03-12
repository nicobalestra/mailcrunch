(ns mailcrunch.model.navtree
  (:use     [clojure.pprint])
  (:require [clojure.zip :as zip]
            [mailcrunch.backend.navtree :as db]))



(defrecord Tree [id parent_id userdef_id children icon_url])

(defn is-parent
"Determines whether curr-node is the parent of node."
  [curr-node node]
  (= (:parent_id node) (:id curr-node)))

(defn is-child
"Determines whether node is or can be a child of curr-node"
[{:keys [id parent_id] :as node} curr-node]
;(println "\nisChild " node " -> " curr-node)
  (and
   (= parent_id (:id curr-node) )
   (not (empty? (seq (filter #(= id (:id %))   (:children curr-node)))))))

(defn can-be-child
"Determines whether node is or can be a child of curr-node"
[{:keys [id parent_id] :as node} curr-node]
;(println "\nisChild " node " -> " curr-node)
  (and
   (= parent_id (:id curr-node))))

(defn is-root [node]
  (nil? (:parent_id node )))

(defn add-node [root new-node]
  (if (is-root new-node)
    new-node
    (if (and
         (not (is-child new-node root))
         (can-be-child new-node root))
      (assoc-in root [:children] (vec (conj (:children root) new-node)))
      (let [buf-children (:children root)
            new-children (for [child buf-children]
                           (add-node child new-node))]
        (assoc-in root [:children] (vec new-children))))))


(defn- map-to-tree
  "Transform the navigation map into a parent-to-child tree so that for each node we store a lazyseq of children nodes."
  [flat-tree]
  (let [tree (reduce add-node {} flat-tree)]
     tree))

(defn get-navtree []
  (let [tree (map-to-tree (db/get-tree))]
    ;(println "The tree: " tree)
    tree)
  )

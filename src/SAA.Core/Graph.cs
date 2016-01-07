using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace SAA.Core
{
    public class Graph<TId> : IEnumerable<INode<TId>>
    {
        private readonly ICollection<INode<TId>> _nodes = new List<INode<TId>>();
        public ICollection<IEdge<TId>> Edges { get; } = new List<IEdge<TId>>();

        public Graph<TId> AddNode(TId id)
        {
            _nodes.Add(new Node(id));
            return this;
        }

        public Graph<TId> JointNodeToSelf(TId node, int? weigth = null)
        {
            var n = GetNode(node);
            n.Joint(n);
            return AddEdge(n, n, weigth);
        }

        public Graph<TId> JointNodeFromTo(TId @from, TId to, int? weigth = null)
        {
            var f = GetNode(@from);
            var t = GetNode(to);
            f.Joint(t);
            return AddEdge(f, t, weigth);
        }

        public Graph<TId> DoubleJointNode(TId from, TId to, int? weigth = null)
        {
            var f = GetNode(@from);
            var t = GetNode(to);
            f.Joint(t);
            t.Joint(f);
            return AddEdge(f, t, weigth);
        }

        public IEnumerator<INode<TId>> GetEnumerator() =>
            _nodes.GetEnumerator();

        private INode<TId> GetNode(TId @from) =>
            _nodes.Single(n => Equals(n.Id, @from));

        private Graph<TId> AddEdge(INode<TId> node1, INode<TId> node2, int? weigth)
        {
            Edges.Add(new Edge(node1, node2, weigth));
            return this;
        }

        private class Node : INode<TId>
        {
            public TId Id { get; }

            public Node(TId id)
            {
                Id = id;
            }

            public INode<TId> Joint(INode<TId> neighbor)
            {
                if (_neighbors.Contains(neighbor))
                    throw new Exception($"The node: {Id} already contains the neighbor: {neighbor.Id}.");
                _neighbors.Add(neighbor);
                return this;
            }

            private readonly ICollection<INode<TId>> _neighbors = new List<INode<TId>>();

            public override string ToString() => $"{Id}: Neighbors: " + string.Join(" ", _neighbors.Select(n => n.Id));
        }

        private class Edge : IEdge<TId>
        {
            public INode<TId> Node1 { get; }
            public INode<TId> Node2 { get; }
            public int? Weigth { get; }

            public Edge(INode<TId> node1, INode<TId> node2, int? weigth)
            {
                Weigth = weigth;
                Node1 = node1;
                Node2 = node2;
            }

            public override string ToString() => $"Edge:\n" +
                                                 $"\tW: {Weigth}\n" +
                                                 $"\tN1: {Node1.Id}\n" +
                                                 $"\tN2: {Node2.Id}";
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}
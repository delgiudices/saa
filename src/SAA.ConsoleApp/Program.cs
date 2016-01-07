using System;
using System.Linq;
using SAA.Core;

namespace SAA.ConsoleApp
{
    class Program
    {
        static void Main(string[] args)
        {
            var g = new Graph<char>();
            g.AddNode('a');
            g.AddNode('b');
            g.AddNode('c');
            g.JointNodeFromTo('a', 'b', 1);
            g.JointNodeFromTo('a', 'a', 2);
            g.JointNodeFromTo('b', 'c', 3);
            g.JointNodeFromTo('c', 'a', 4);
            g.ToList().ForEach(Console.WriteLine);
            g.Edges.ToList().ForEach(Console.WriteLine);
            Console.ReadKey();
        }
    }
}
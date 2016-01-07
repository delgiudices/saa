namespace SAA.Core
{
    public interface IEdge<TId>
    {
        INode<TId> Node2 { get; }
        INode<TId> Node1 { get; }
    }
}
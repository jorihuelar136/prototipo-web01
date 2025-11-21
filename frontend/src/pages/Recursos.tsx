export default function Recursos() {
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Recursos</h2>
      <p className="text-gray-600 mb-6 text-sm">Biblioteca de materiales formativos.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="h-24 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">PDF</div>
        <div className="h-24 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">Video</div>
        <div className="h-24 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">Audio</div>
      </div>
    </div>
  );
}
